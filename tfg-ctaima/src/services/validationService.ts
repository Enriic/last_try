// src/services/validationService.ts

import axios from 'axios';
import { Validation, ValidationRequest } from '../types';
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

    return response.data;
};

export const createValidation = async (
    documentId: string,
    user: string,
    status: string,
    validation_details: ValidationRequest | undefined,
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