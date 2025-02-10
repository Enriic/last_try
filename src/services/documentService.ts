// src/services/documentService.ts

import axios from 'axios';
import { DocumentType, Document } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const getDocumentTypes = async (page = 1, pageSize = 10, search = '') => {
  const response = await axios.get(`${API_URL}/api/documentTypes/`, {
    params: { page, page_size: pageSize, search },
    withCredentials: true,
  });
  return response.data;
};

export const getDocumentTypesByIds = async (ids: string[]): Promise<DocumentType[]> => {
  const params = {
    id__in: ids.join(','),
  };

  console.log('Params: ', params);
  const response = await axios.get<DocumentType[]>(`${API_URL}/api/documentTypes/`, { params });
  console.log('Response: ', response.data);
  return response.data;
}


export const getDocuments = async (page = 1, pageSize = 10, search = '') => {
  const response = await axios.get(`${API_URL}/api/document/`, {
    params: { page, page_size: pageSize, search },
    withCredentials: true,
  });
  return response.data;
};

export const getDocumentsByIds = async (ids: string[]): Promise<Document[]> => {

  const params = {
    id__in: ids.join(','),
  };
  const response = await axios.get<Document[]>(`${API_URL}/api/document/`, { params });
  return response.data;
};

export const getDocumentTypeById = async (documentTypeId: string | number | null) => {
  const response = await axios.get(`${API_URL}/api/documentTypes/${documentTypeId}/`, {
    withCredentials: true,
  });
  return response.data;
}

export const getDocument = async (documentId: string, field?: string) => {
  const response = await axios.get(`${API_URL}/api/document/${documentId}/`, {
    withCredentials: true,
  });
  return field && response.data[field] ? response.data[field] : response.data;
};

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


export const uploadDocument = async (
  file: File,
  user: string,
  documentType: number | string,
  entityId: string,
  associatedEntity: string,
) => {
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

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type');
  }

  console.log('Associated entity with entityId:', associatedEntity, entityId);

  const formData = new FormData();
  formData.append('user', user);
  formData.append('file', file);
  formData.append('document_type', documentType.toString());
  formData.append('associated_entity', associatedEntity);
  formData.append(associatedEntity, entityId);  // Esto será 'resource' o 'company'


  try {
    const response = await axios.post(`${API_URL}/api/document/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      validateStatus: (status) => {
        return status >= 200 && status < 300 || status === 409; // Accept 409 as valid response
      },
    });

    if (response.status === 409) {
      // El documento ya existe
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