// src/services/validationService.ts

import axios from 'axios';
import { Field, Validation } from '../types';
import { User } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const getValidations = async (
    all: boolean,
    user: User | null,   
): Promise<Validation[]> => {


    const endpoint = all ? `${API_URL}/api/validation/` : `${API_URL}/api/users/${user?.id}/validations/`;

    const response = await axios.get<Validation[]>(endpoint, {
        withCredentials: true,
    });

    // // Usa Promise.all para esperar todas las solicitudes asincrónicas de documentos
    // const validationsWithDocumentInfo = await Promise.all(response.data.map(async (validation) => {
    //     const documentResponse = await axios.get(`${API_URL}/api/document/${validation.document}/`, {
    //         withCredentials: true,
    //     });

        
    //     const documentTypeResponse = await axios.get(`${API_URL}/api/documentTypes/${documentResponse.data.document_type}/`, {
    //         withCredentials: true,
    //     });

    //     // Agregar la información del documento a la validación
    //     validation.document_info = documentResponse.data;
    //     validation.document_info.document_type_name = documentTypeResponse.data.name;

    //     return validation; // Devolver la validación con la información del documento
    // }));

    //return validationsWithDocumentInfo; // Devolver las validaciones con toda la información
    return response.data;
};

export const createValidation = async (
    documentId: string,
    user: string,
    status: string,
    validation_details: Field[],
) => {

    const formData = new FormData();
    formData.append('document', documentId);
    formData.append('user', user);
    formData.append('status', status);
    formData.append('validation_details', JSON.stringify(validation_details));

    const response = await axios.post(`${API_URL}/api/validation/`, formData,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}