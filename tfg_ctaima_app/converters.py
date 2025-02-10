# utils/converters.py

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