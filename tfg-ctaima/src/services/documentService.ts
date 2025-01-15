// src/services/documentService.ts

import axios from 'axios';
import { DocumentType, Resource } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const getDocumentTypes = async () => {
    const response = await axios.get(`${API_URL}/api/documentTypes/`, {
        withCredentials: true,
    });
    return response.data;
};

export const getDocuments = async () => {
    const response = await axios.get(`${API_URL}/api/document/`, {
        withCredentials: true,
    });
    return response.data;
};

export const getDocument = async (documentId: string) => {
    const response = await axios.get(`${API_URL}/api/document/${documentId}/`, {
        withCredentials: true,
    });
    return response.data;
};



export const uploadDocument = async (
  filename: string,
  user: string,
  documentType: DocumentType,
  resource: Resource
) => {
  const formData = new FormData();
  formData.append('user', user);
  formData.append('name', filename);
  formData.append('document_type', documentType.id.toString());
  formData.append('resource', resource.id);
//   formData.append('resource_type', resource.resource_type);

  const response = await axios.post(`${API_URL}/api/document/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};