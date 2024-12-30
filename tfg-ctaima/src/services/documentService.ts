// src/services/documentService.ts

import axios from 'axios';

export const getDocumentTypes = async () => {
    const API_URL = 'http://localhost:8000'; // Ajusta la URL según corresponda
    const response = await axios.get(`${API_URL}/api/documentTypes/`, {
        withCredentials: true,
    });
    return response.data;
};