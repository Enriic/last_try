// src/services/validationService.ts

import axios from 'axios';
import { Validation, ValidationRequest, ValidationResponse } from '../types';
import { ValidationFilterOptions } from '../types/filters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getValidations = async (filters: ValidationFilterOptions | null, page: number | null, pageSize: number | null): Promise<ValidationResponse> => {
    const params: { [key: string ]: string | number | null} = {
        page: page || 1,
        page_size: pageSize || 10,
        ...filters
    };

    const response = await axios.get<ValidationResponse>(`${API_URL}/api/validation/`, { params });
    return response.data;
};

export const getValidationsForSelect = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/validation/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
};

export const getAllValidations = async (filters: ValidationFilterOptions | null): Promise<Validation[]> => {
    const response = await axios.get<Validation[]>(`${API_URL}/api/validation/allValidations/`, {
        params: filters,
        withCredentials: true,
    });
    return response.data;
}


export const getValidationById = async (query: string): Promise<Validation[]> => {
    const response = await axios.get<Validation[]>(`${API_URL}/api/validation/search/`, {
        params: { query },
        withCredentials: true,
    });
    return response.data;
}


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

    const response = await axios.post(`${API_URL}/api/validation/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}