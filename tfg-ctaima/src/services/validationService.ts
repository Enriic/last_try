// src/services/validationService.ts

import axios from 'axios';
import { Validation } from '../types';
import { User } from '../context/AuthContext';

export const getValidations = async (all: boolean, user: User | null): Promise<Validation[]> => {
    const API_URL = 'http://localhost:8000'; // Ajusta la URL según corresponda

    const endpoint = all ? `${API_URL}/api/validation/` : `${API_URL}/api/users/${user?.id}/validations/`;

    const response = await axios.get<Validation[]>(endpoint, {
        withCredentials: true,
    });

    // Usa Promise.all para esperar todas las solicitudes asincrónicas de documentos
    const validationsWithDocumentInfo = await Promise.all(response.data.map(async (validation) => {
        const documentResponse = await axios.get(`${API_URL}/api/document/${validation.document}/`, {
            withCredentials: true,
        });

        // Obtener el nombre del tipo de documento
        const documentTypeResponse = await axios.get(`${API_URL}/api/documentTypes/${documentResponse.data.document_type}/`, {
            withCredentials: true,
        });

        // Agregar la información del documento a la validación
        validation.document_info = documentResponse.data;
        validation.document_info.document_type_name = documentTypeResponse.data.name;

        return validation; // Devolver la validación con la información del documento
    }));

    console.log("IM EXECUTING"); // Este log ahora ocurrirá después de que todas las validaciones estén completas
    return validationsWithDocumentInfo; // Devolver las validaciones con toda la información
};
