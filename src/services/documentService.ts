// src/services/documentService.ts

import axios from 'axios';
import { DocumentType, Document } from '../types';

/**
 * URL base de la API, obtenida de las variables de entorno o valor por defecto
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Obtiene una lista de tipos de documento, con soporte para paginación y búsqueda
 * @param page - Número de página
 * @param pageSize - Elementos por página
 * @param search - Término de búsqueda opcional
 * @returns Respuesta con la lista de tipos de documento
 */
export const getDocumentTypes = async (page = 1, pageSize = 10, search = '') => {
  const response = await axios.get(`${API_URL}/api/documentTypes/`, {
    params: { page, page_size: pageSize, search },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Obtiene tipos de documento por sus identificadores
 * @param ids - Array de IDs de tipos de documento
 * @returns Array de tipos de documento
 */
export const getDocumentTypesByIds = async (ids: string[]): Promise<DocumentType[]> => {
  const params = {
    id__in: ids.join(','),
  };

  console.log('Params: ', params);
  const response = await axios.get<DocumentType[]>(`${API_URL}/api/documentTypes/`, { params });
  console.log('Response: ', response.data);
  return response.data;
}

/**
 * Obtiene una lista de documentos, con soporte para paginación y búsqueda
 * @param page - Número de página
 * @param pageSize - Elementos por página
 * @param search - Término de búsqueda opcional
 * @returns Respuesta con la lista de documentos
 */
export const getDocuments = async (page = 1, pageSize = 10, search = '') => {
  const response = await axios.get(`${API_URL}/api/document/`, {
    params: { page, page_size: pageSize, search },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Obtiene documentos por sus identificadores
 * @param ids - Array de IDs de documento
 * @returns Array de documentos
 */
export const getDocumentsByIds = async (ids: string[]): Promise<Document[]> => {
  const params = {
    id__in: ids.join(','),
  };
  const response = await axios.get<Document[]>(`${API_URL}/api/document/`, { params });
  return response.data;
};

/**
 * Obtiene un tipo de documento por su ID
 * @param documentTypeId - ID del tipo de documento
 * @returns Datos del tipo de documento
 */
export const getDocumentTypeById = async (documentTypeId: string | number | null) => {
  if (documentTypeId === null || documentTypeId === undefined) return
  const response = await axios.get(`${API_URL}/api/documentTypes/${documentTypeId}/`, {
    withCredentials: true,
  });
  return response.data;
}

/**
 * Obtiene un documento por su ID, opcionalmente devolviendo solo un campo específico
 * @param documentId - ID del documento
 * @param field - Campo específico a devolver (opcional)
 * @returns Documento completo o el campo específico solicitado
 */
export const getDocument = async (documentId: string, field?: string) => {
  const response = await axios.get(`${API_URL}/api/document/${documentId}/`, {
    withCredentials: true,
  });
  return field && response.data[field] ? response.data[field] : response.data;
};

/**
 * Obtiene el contenido binario de un documento desde el contenedor de blobs
 * @param documentId - ID del documento
 * @returns Blob con el contenido del documento
 */
export const getDocumentFromBlobContainer = async (documentId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/documents/${documentId}/`, {
      responseType: 'blob',
      withCredentials: true,
    });

    const pdfBlob = response.data;
    return pdfBlob;

  } catch (error) {
    console.error('Error al obtener el PDF:', error);
  }
}

/**
 * Sube un nuevo documento al sistema
 * @param file - Archivo a subir
 * @param user - ID del usuario que sube el documento
 * @param documentType - ID del tipo de documento
 * @param resourceId - ID del recurso asociado (opcional)
 * @param companyId - ID de la compañía asociada (opcional)
 * @param associatedEntities - Array de entidades a las que asociar el documento
 * @returns Respuesta con los datos del documento subido o información de duplicado
 */
export const uploadDocument = async (
  file: File,
  user: string,
  documentType: number | string,
  resourceId: string | null,
  companyId: string | null,
  associatedEntities: string[],
) => {
  // Tipos de archivo permitidos
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/bmp',
    'image/tiff'
  ];

  // Validación de tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type');
  }

  // Preparación de los datos del formulario
  const formData = new FormData();
  formData.append('user', user);
  formData.append('file', file);
  formData.append('document_type', documentType.toString());
  formData.append('resource', resourceId || '');
  formData.append('company', companyId || '');
  formData.append('associated_entities', JSON.stringify(associatedEntities));

  try {
    // Envío de la petición
    const response = await axios.post(`${API_URL}/api/document/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Aceptamos 409 como respuesta válida (documento duplicado)
      validateStatus: (status) => {
        return status >= 200 && status < 300 || status === 409;
      },
    });

    // Si el documento está duplicado
    if (response.status === 409) {
      return {
        status: 409,
        data: response.data, // Contiene 'detail' y 'document'
      };
    }

    // Si todo va bien, retornamos los datos del nuevo documento
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Facilita la descarga de un documento
 * @param documentId - ID del documento a descargar
 */
export const handleDownload = async (documentId: string) => {
  try {
    // Obtener el contenido del documento
    const response = await getDocumentFromBlobContainer(documentId);
    // Obtener el nombre del documento
    const document_name = await getDocument(documentId, 'name');

    // Crear blob y URL
    const pdfBlob = response;
    const fileURL = URL.createObjectURL(pdfBlob);

    // Crear elemento de enlace para la descarga
    const link = document.createElement('a');
    link.href = fileURL;
    link.setAttribute('download', document_name);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    document.body.removeChild(link);
    URL.revokeObjectURL(fileURL);
  } catch (error) {
    console.error('Error al descargar el PDF:', error);
  }
}