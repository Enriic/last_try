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

    return info






    