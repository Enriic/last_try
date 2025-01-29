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

export const getDocument = async (documentId: string) => {
  const response = await axios.get(`${API_URL}/api/document/${documentId}/`, {
    withCredentials: true,
  });
  return response.data;
};

export const uploadDocument = async (
  filename: string,
  user: string,
  documentType: number | string,
  resource: string
) => {
  const formData = new FormData();
  formData.append('user', user);
  formData.append('name', filename);
  formData.append('document_type', documentType.toString());
  formData.append('resource', resource);

  const response = await axios.post(`${API_URL}/api/document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};