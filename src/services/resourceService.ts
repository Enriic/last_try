// src/services/resourceService.ts

import axios from 'axios';
import { Resource, ResourceResponse } from '../types';

/**
 * URL base de la API, obtenida de las variables de entorno o valor por defecto
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Obtiene todos los recursos disponibles
 * @returns Lista de todos los recursos
 */
export const getResources = async (): Promise<Resource[]> => {
    const response = await axios.get<Resource[]>(`${API_URL}/api/resources/`, {
        withCredentials: true,
    });
    return response.data;
};

/**
 * Obtiene un recurso específico por su ID
 * @param id - Identificador único del recurso
 * @returns Datos del recurso solicitado
 */
export const getResource = async (id: string) => {
    const response = await axios.get<Resource>(`${API_URL}/api/resources/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

/**
 * Obtiene recursos por su tipo, con soporte para paginación y búsqueda
 * @param type - Tipo de recurso (en plural, ej: 'employees', 'vehicles')
 * @param page - Número de página
 * @param pageSize - Elementos por página
 * @param search - Término de búsqueda opcional
 * @returns Respuesta con la lista de recursos del tipo especificado
 */
export const getResourcesByType = async (type: string = 'employees', page = 1, pageSize = 10, search = '') => {
    const response = await axios.get<ResourceResponse>(`${API_URL}/api/${type}/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
}

/**
 * Obtiene un recurso por su ID (alternativa a getResource)
 * @param id - Identificador único del recurso
 * @returns Datos del recurso solicitado
 */
export const getResourceById = async (id: string | null) => {
    const response = await axios.get<Resource>(`${API_URL}/api/resources/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

/**
 * Obtiene múltiples recursos por sus IDs
 * @param ids - Array de identificadores de recursos
 * @returns Lista de recursos que coinciden con los IDs proporcionados
 */
export const getResourcesByIds = async (ids: string[]): Promise<Resource[]> => {
    const params = {
        id__in: ids.join(','),
    };
    const response = await axios.get<Resource[]>(`${API_URL}/api/resources/`, { params });
    return response.data;
};

/**
 * Busca recursos con paginación
 * @param page - Número de página
 * @param pageSize - Elementos por página
 * @param search - Término de búsqueda
 * @returns Recursos filtrados según el término de búsqueda
 */
export const getResourcesBySearch = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/resources/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
}

/**
 * Crea un nuevo recurso genérico
 * @param resource - Datos del recurso a crear
 * @returns Datos del recurso creado
 */
export const createResource = async (resource: any) => {
    const response = await axios.post(`${API_URL}/api/resources/`, resource, {
        withCredentials: true,
    });
    return response.data;
}

/**
 * Actualiza un recurso existente
 * @param id - Identificador del recurso a actualizar
 * @param resource - Nuevos datos para el recurso
 * @returns Datos actualizados del recurso
 */
export const updateResource = async (id: string, resource: any) => {
    const response = await axios.put(`${API_URL}/api/resources/${id}/`, resource, {
        withCredentials: true,
    });
    console.log('resource data', resource)
    return response.data;
}

/**
 * Crea un nuevo empleado (recurso de tipo empleado)
 * @param resource - Datos del empleado a crear
 * @returns Datos del empleado creado
 */
export const createEmployee = async (resource: any) => {
    const response = await axios.post(`${API_URL}/api/employees/`, resource, {
        withCredentials: true,
    });
    return response.data;
}

/**
 * Actualiza un empleado existente
 * @param id - Identificador del empleado a actualizar
 * @param resource - Nuevos datos para el empleado
 * @returns Datos actualizados del empleado
 */
export const updateEmployee = async (id: string, resource: any) => {
    const response = await axios.put(`${API_URL}/api/employees/${id}/`, resource, {
        withCredentials: true,
    });
    console.log('resource data', resource)
    return response.data;
}