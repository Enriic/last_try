import hashlib
import re
import os
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions, BlobClient
from django.conf import settings
from datetime import datetime, timedelta
from azure.core.exceptions import ResourceExistsError
import json
import ast


MAX_FILENAME_LENGTH = 50  # Puedes ajustar este valor según necesites

DOCUMENT_TYPE_MAP = {
    1: 'default',
    2: 'dni',
    3: 'company info',
    # Agrega más tipos de documentos según sea necesario
}

def get_param_name(document_type_id):
    """
    Retorna el nombre del parámetro que el endpoint espera basado en el id del documento.
    
    Args:
        document_type_id (int): El ID del tipo de documento.
    
    Returns:
        str: El nombre del parámetro para el endpoint.
    """
    return DOCUMENT_TYPE_MAP.get(document_type_id)

def truncate_filename(filename, max_length):
    name, ext = os.path.splitext(filename)
    if len(name) > max_length:
        name = name[:max_length]
    return name + ext


def calculate_file_hash(file):
    sha256 = hashlib.sha256()
    for chunk in file.chunks():
        sha256.update(chunk)
    file.seek(0)
    return sha256.hexdigest()

def clean_filename(filename):
    return re.sub(r'[<>:"/\\|?*\x00-\x1F]', '_', filename)


def upload_to_blob_storage(uploaded_file, blob_name):
    try:
        # Crear el cliente del servicio Blob
        connect_str = f"DefaultEndpointsProtocol=https;AccountName={settings.AZURE_ACCOUNT_NAME};AccountKey={settings.AZURE_ACCOUNT_KEY};EndpointSuffix=core.windows.net"
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER)
        blob_client = container_client.get_blob_client(blob_name)

        # Subir el archivo si no existe
        if not blob_client.exists():
            blob_client.upload_blob(uploaded_file, overwrite=False)
        # Obtener la URL del blob
        blob_url = blob_client.url
        return blob_url
    except Exception as e:
        raise Exception(f"Error uploading file to Azure Blob Storage: {str(e)}")

def generate_sas_token(blob_name, permissions, expiry_hours=5):
    sas_token = generate_blob_sas(
        account_name=settings.AZURE_ACCOUNT_NAME,
        container_name=settings.AZURE_CONTAINER,
        blob_name=blob_name,
        account_key=settings.AZURE_ACCOUNT_KEY,
        permission=permissions,
        expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
    )
    return sas_token


def transform_validation_details(data):
    
    data = json.loads(data)
    transformed_data = {}

    # Transform fields_to_validate: convert list into a dict keyed by field name,
    # rename 'expected_value' to 'value' and add a threshold of 80.
    new_fields_to_validate = {}
    for field in data.get("fields_to_validate", []):
        field_name = field.get("name")
        new_fields_to_validate[field_name] = {
            "value": field.get("expected_value"),
            "description": field.get("description"),
            "threshold": 80  # threshold is hardcoded as 80 per the example
        }
    transformed_data["fields_to_validate"] = new_fields_to_validate

    # Transform fields_to_extract: convert list into a dict keyed by field name,
    # and include only the description.
    new_fields_to_extract = {}
    for field in data.get("fields_to_extract", []):
        field_name = field.get("name")
        new_fields_to_extract[field_name] = {
            "description": field.get("description")
        }
    transformed_data["fields_to_extract"] = new_fields_to_extract

    return transformed_data


def update_info(data_extracted, info):
    """
    Actualiza la plantilla con los valores extraídos.
    
    Se recorren las secciones 'fields_to_extract' y 'fields_to_validate' de la plantilla.
    Para cada campo se busca una coincidencia en 'datos_extraidos' usando la clave 'name'.
    Si el dato encontrado es un diccionario que contiene 'campo_extraido', se utiliza ese valor.
    
    :param datos_extraidos: dict con los datos extraídos.
    :param plantilla: dict con la plantilla a actualizar.
    :return: dict con la plantilla actualizada.
    """

    for field in info.get('fields_to_validate', []):
        field_name = field.get('name')
        if field_name and field_name in data_extracted:
            extracted_data = data_extracted.get(field_name, {})
            # Verificamos si extracted_data es un diccionario:
            if isinstance(extracted_data, dict):
                extracted_value = extracted_data.get('campo_extraido')
            else:
                extracted_value = extracted_data  # Usamos el valor directamente
            if extracted_value:
                field['obtained_value'] = extracted_value
                if field.get('expected_value') == extracted_value:
                    field['result'] = 'success'
                else:
                    field['result'] = 'failure'

    # Actualizar 'fields_to_extract'
    for field in info.get('fields_to_extract', []):
        field_name = field.get('name')
        if field_name and field_name in data_extracted:
            extracted_data = data_extracted.get(field_name, {})
            if isinstance(extracted_data, dict):
                extracted_value = extracted_data.get('campo_extraido')
            else:
                extracted_value = extracted_data
            if extracted_value:
                field['obtained_value'] = extracted_value

    print(f"Output from update_info: {info}")
    return info


#FOR NEW RESPONSE FORMAT AND ALSO WORKS FOR OLD RESPONSE FORMAT

def process_api_response(api_response, template):
    """
    Procesa una respuesta de API y actualiza la plantilla con la estructura específica.
    
    :param api_response: La respuesta original de la API (cualquier estructura)
    :param template: La plantilla con estructura específica que se va a actualizar
    :return: La plantilla actualizada
    """
    # Paso 1: Aplanar parcialmente los datos
    flattened_data = partial_flatten(api_response)
    
    # Paso 2: Actualizar la plantilla usando los datos aplanados
    updated_template = update_template_structure(flattened_data, template)
    
    return updated_template

def partial_flatten(data):
    """
    Aplana un diccionario recursivamente, pero preserva las estructuras
    que contienen 'campo_extraido' y 'campo_original'.
    
    :param data: El diccionario a aplanar.
    :return: Un diccionario parcialmente aplanado.
    """
    items = {}
    
    if not isinstance(data, dict):
        return data
    
    # Verificar si es una estructura que debemos preservar intacta
    if 'campo_extraido' in data or 'campo_original' in data:
        return data  # Preservamos esta estructura
    
    # # Para el caso especial de matched_extractions, procesamos cada documento
    if 'matched_extractions' in data:
        items['matched_extractions'] = []
        for match in data['matched_extractions']:
            processed_match = {}
            for doc_type, doc_data in match.items():
                if 'extraccion' in doc_data:
                    processed_match[doc_type] = {
                        'extraccion': doc_data['extraccion'],
                        'page': doc_data.get('page')
                    }
            items['matched_extractions'].append(processed_match)
        
        # Procesamos el resto del diccionario
        for key, value in data.items():
            if key != 'matched_extractions':
                if isinstance(value, dict):
                    items[key] = partial_flatten(value)
                else:
                    items[key] = value
        
        return items
    
    # Casos especiales para el detalle
    if 'detalle' in data:
        items['detalle'] = {}
        # Procesamos cada sección del detalle
        for key, value in data['detalle'].items():
            if isinstance(value, dict):
                # Verificar si es una estructura anidada con el mismo nombre
                if key in value and isinstance(value[key], dict):
                    items['detalle'][key] = value[key]  # Mantenemos la estructura con campo_extraido
                else:
                    items['detalle'][key] = partial_flatten(value)
            else:
                items['detalle'][key] = value
        
        # Procesamos el resto del diccionario
        for key, value in data.items():
            if key != 'detalle':
                if isinstance(value, dict):
                    items[key] = partial_flatten(value)
                else:
                    items[key] = value
                    
        return items
    
    # Caso normal: aplanar pero preservar estructuras con campo_extraido
    for key, value in data.items():
        if isinstance(value, dict):
            # Caso especial: estructura anidada con mismo nombre (ej: company_name.company_name)
            if key in value and isinstance(value[key], dict):
                if 'campo_extraido' in value[key] or 'campo_original' in value[key]:
                    items[key] = value[key]  # Mantener la estructura con campo_extraido/campo_original
                else:
                    items[key] = partial_flatten(value[key])
            else:
                # Procesamos el diccionario normalmente
                items[key] = partial_flatten(value)
        elif isinstance(value, list):
            # Para listas, procesamos cada elemento individualmente
            processed_list = []
            for item in value:
                processed_list.append(partial_flatten(item))
            items[key] = processed_list
        else:
            items[key] = value
    
    return items

def update_template_structure(flattened_data, template):
    """
    Actualiza la plantilla con estructura específica usando los datos aplanados.
    
    :param flattened_data: Datos parcialmente aplanados
    :param template: Plantilla con estructura específica a actualizar
    :return: Plantilla actualizada
    """
    # Actualizar campos de validación
    for field_name, field_config in template.get('fields_to_validate', {}).items():
        # Buscar el campo en los datos aplanados
        field_value = find_field(flattened_data, field_name)
        if field_value:
            # Extraer el valor para comparación
            extracted_value = extract_value_for_validation(field_value)
            if extracted_value is not None:
                # Añadir el valor obtenido al campo
                field_config['obtained_value'] = extracted_value
                
                # Verificar si cumple con el valor esperado
                expected_value = field_config.get('value')
                if expected_value == extracted_value:
                    field_config['result'] = 'success'
                else:
                    field_config['result'] = 'failure'

    # Actualizar campos de extracción
    for field_name, field_config in template.get('fields_to_extract', {}).items():
        # Buscar el campo en los datos aplanados
        field_value = find_field(flattened_data, field_name)
        if field_value:
            # Para extracción, guardamos el objeto completo
            field_config['obtained_value'] = field_value

    return template

def find_field(data, field_name):
    """
    Busca un campo en los datos parcialmente aplanados y devuelve 
    el objeto completo o el valor.
    
    :param data: Diccionario parcialmente aplanado.
    :param field_name: Nombre del campo a buscar.
    :return: El objeto o valor encontrado, o None si no se encuentra.
    """
    # Verificar si el campo existe directamente
    if field_name in data:
        return data[field_name]
    
    # Buscar en estructuras anidadas
    if isinstance(data, dict):
        # Buscar en detalle si existe
        if 'detalle' in data and isinstance(data['detalle'], dict):
            if field_name in data['detalle']:
                return data['detalle'][field_name]
            
            # Buscar en subestructuras del detalle
            for key, value in data['detalle'].items():
                if isinstance(value, dict):
                    if field_name in value:
                        return value[field_name]
        
        # Buscar en matched_extractions si existe
        if 'matched_extractions' in data and data['matched_extractions']:
            for match in data['matched_extractions']:
                for doc_type, doc_data in match.items():
                    if 'extraccion' in doc_data and field_name in doc_data['extraccion']:
                        return doc_data['extraccion'][field_name]
        
        # Buscar en otros diccionarios anidados
        for key, value in data.items():
            if key != 'detalle' and key != 'matched_extractions':
                if isinstance(value, dict):
                    # Si el diccionario contiene el campo buscado
                    if field_name in value:
                        return value[field_name]
                    
                    # Buscar recursivamente
                    result = find_field(value, field_name)
                    if result is not None:
                        return result
                
                # Buscar en listas
                elif isinstance(value, list):
                    for item in value:
                        result = find_field(item, field_name)
                        if result is not None:
                            return result
    
    # Si llegamos aquí, no se encontró el campo
    return None

def extract_value_for_validation(field_data):
    """
    Extrae el valor para validación.
    """
    if isinstance(field_data, dict):
        if 'campo_extraido' in field_data:
            return field_data['campo_extraido']
    
    return field_data

# Ejemplo de uso:
# api_response = {
#     "coste": 0.000251,
#     "detalle": {
#         "company_name": {
#             "company_name": {
#                 "campo_extraido": "OVAL ENERGY, S.L.",
#                 "campo_original": "Oval Energy, S.L."
#             },
#             "valido": True
#         }
#     },
#     "company_id": {
#         "campo_extraido": "B65833733",
#         "campo_original": "B65833733"
#     }
# }

# template = {
#     "fields_to_validate": {
#         "company_name": {
#             "value": "Oval Energy, S.L.", 
#             "description": "el nombre o razón social de la empresa", 
#             "threshold": 80
#         },
#         "company_id": {
#             "value": "B65833733", 
#             "description": "NIF de la empresa", 
#             "threshold": 80
#         }
#     },
#     "fields_to_extract": {
#         "issue_date": {
#             "description": "Fecha de emisión"
#         }
#     }
# }

# updated_template = process_api_response(api_response, template)
# print(updated_template)

# Para buscar un campo específico después
# def get_field_from_template(template, field_name):
#     """
#     Obtiene un campo específico de la plantilla.
    
#     :param template: La plantilla actualizada
#     :param field_name: Nombre del campo a buscar
#     :return: La configuración completa del campo o None si no se encuentra
#     """
#     # Buscar en campos de validación
#     if field_name in template.get('fields_to_validate', {}):
#         return template['fields_to_validate'][field_name]
    
#     # Buscar en campos de extracción
#     if field_name in template.get('fields_to_extract', {}):
#         return template['fields_to_extract'][field_name]
    
#     return None


def transform_fields(data):
    """
    Transforms the input JSON structure to the target format.

    The transformation converts object dictionaries for both 
    fields_to_validate and fields_to_extract into arrays of objects.
    Each object will include the original key as its "name" field.
    
    For fields_to_validate, the "expected_value" is taken from "value"
    and "obtained_value" is set to "pending_to_obtain".
    
    For fields_to_extract, the "obtained_value" remains the same.
    
    Parameters:
      data (dict): The original data with "fields_to_validate" and "fields_to_extract".
      
    Returns:
      dict: A new dictionary in the target format.
    """
    # Transform fields_to_validate.
    new_fields_to_validate = []
    for key, details in data.get("fields_to_validate", {}).items():
        new_entry = {
            "name": key,
            "description": details.get("description"),
            "expected_value": details.get("value"),
            "obtained_value": details.get("obtained_value")
        }
        new_fields_to_validate.append(new_entry)

    # Transform fields_to_extract.
    new_fields_to_extract = []
    for key, details in data.get("fields_to_extract", {}).items():
        new_entry = {
            "name": key,
            "description": details.get("description"),
            "obtained_value": details.get("obtained_value")
        }
        new_fields_to_extract.append(new_entry)

    return {
        "fields_to_validate": new_fields_to_validate,
        "fields_to_extract": new_fields_to_extract
    }
