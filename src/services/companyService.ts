// src/services/companyService.ts

import axios from 'axios';
import { Company, CompanyResponse } from '../types';
import { API_URL } from '../config';


/**
 * URL base de la API, obtenida de las variables de entorno o valor por defecto
 */
//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Obtiene una lista paginada de compañías que pueden incluir filtrado por búsqueda
 * @param page - Número de página a consultar
 * @param pageSize - Cantidad de elementos por página
 * @param search - Término de búsqueda opcional
 * @returns Respuesta con la lista de compañías y metadatos de paginación
 */
export const getCompaniesForSelect = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/companies/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
};

/**
 * Obtiene los detalles de una compañía específica por su ID
 * @param companyId - Identificador único de la compañía
 * @returns Datos detallados de la compañía
 */
export const getCompanyById = async (companyId: string | number | null) => {
    const response = await axios.get(`${API_URL}/api/companies/${companyId}/`, {
        withCredentials: true,
    });
    return response.data;
};

/**
 * Crea una nueva compañía en el sistema
 * @param company - Datos de la compañía a crear
 * @returns Datos de la compañía creada
 */
export const createCompany = async (company: any) => {
    const response = await axios.post(`${API_URL}/api/companies/`, company, {
        withCredentials: true,
    });
    return response.data;
};

/**
 * Actualiza los datos de una compañía existente
 * @param companyId - Identificador único de la compañía a actualizar
 * @param company - Nuevos datos para la compañía
 * @returns Datos actualizados de la compañía
 */
export const updateCompany = async (companyId: string | number | null, company: any) => {
    const response = await axios.put(`${API_URL}/api/companies/${companyId}/`, company, {
        withCredentials: true,
    });
    return response.data;
};