// src/services/utilsService.ts

import axios from 'axios';

/**
 * URL base de la API de países, obtenida de las variables de entorno o valor por defecto
 */
const API_URL = import.meta.env.VITE_COUNTRIES_API_URL || 'https://restcountries.com/v3.1';

/**
 * Obtiene un campo específico para todos los países
 * @param field - Campo a obtener (ej: 'name', 'capital', 'currencies')
 * @returns Datos del campo solicitado para todos los países
 */
export const getField = async (field: string) => {
    const response = await axios.get(`${API_URL}/all?fields=${field}`, {
        withCredentials: true,
    });
    return response.data;
}

/**
 * Obtiene un campo específico para un país determinado por su nombre
 * @param name - Nombre del país 
 * @param field - Campo a obtener (ej: 'name', 'capital', 'currencies')
 * @returns Datos del campo solicitado para el país especificado
 */
export const getFieldByName = async (name: string, field: string) => {
    const response = await axios.get(`${API_URL}/name/${name}?fields=${field}`, {
        withCredentials: true,
    });
    return response.data;
}