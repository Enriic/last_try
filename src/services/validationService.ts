// src/services/validationService.ts

import axios from 'axios';
import { Validation, ValidationRequest, ValidationResponse } from '../types';
import { ValidationFilterOptions } from '../types/filters';
import { API_URL } from '../config';

/**
 * Obtiene validaciones con filtros y paginación
 * @param filters - Opciones de filtrado para las validaciones
 * @param page - Número de página a consultar
 * @param pageSize - Cantidad de elementos por página
 * @returns Respuesta con la lista de validaciones y metadatos de paginación
 */
export const getValidations = async (filters: ValidationFilterOptions | null, page: number | null, pageSize: number | null): Promise<ValidationResponse> => {
    const params: { [key: string]: string | number | null } = {
        page: page || 1,
        page_size: pageSize || 10,
        ...filters
    };

    const response = await axios.get<ValidationResponse>(`${API_URL}/api/validation/`, { params });
    return response.data;
};

/**
 * Obtiene validaciones para componentes de selección, con soporte para paginación y búsqueda
 * @param page - Número de página a consultar
 * @param pageSize - Cantidad de elementos por página
 * @param search - Término de búsqueda opcional
 * @returns Respuesta con la lista de validaciones
 */
export const getValidationsForSelect = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/validation/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
};

/**
 * Obtiene todas las validaciones que cumplen con los filtros proporcionados
 * @param filters - Opciones de filtrado para las validaciones
 * @returns Lista completa de validaciones que cumplen con los filtros
 */
export const getAllValidations = async (filters: ValidationFilterOptions | null): Promise<Validation[]> => {
    const response = await axios.get<Validation[]>(`${API_URL}/api/validation/allValidations/`, {
        params: filters,
        withCredentials: true,
    });
    return response.data;
}

/**
 * Busca validaciones por un término de búsqueda
 * @param query - Término de búsqueda
 * @returns Lista de validaciones que coinciden con el término de búsqueda
 */
export const getValidationById = async (query: string): Promise<Validation[]> => {
    const response = await axios.get<Validation[]>(`${API_URL}/api/validation/search/`, {
        params: { query },
        withCredentials: true,
    });
    return response.data;
}

/**
 * Crea una nueva validación
 * @param documentId - ID del documento a validar
 * @param user - ID del usuario que crea la validación
 * @param status - Estado de la validación (success, failure, etc)
 * @param validation_details - Detalles de la validación
 * @returns Datos de la validación creada
 */
export const createValidation = async (
    documentId: string,
    user: string,
    status: string,
    validation_details: ValidationRequest | undefined,
) => {
    // Crear un objeto FormData para enviar los datos
    const formData = new FormData();
    formData.append('document', documentId);
    formData.append('user', user);
    formData.append('status', status);
    formData.append('validation_details', JSON.stringify(validation_details));

    // Enviar la petición POST
    const response = await axios.post(`${API_URL}/api/validation/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}