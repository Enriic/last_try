// src/services/authService.ts

import axios from 'axios';
import { API_URL } from '../config';

// Configura Axios para enviar cookies en cada petición
axios.defaults.withCredentials = true;

//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Función para obtener el token CSRF de las cookies
const getCsrfTokenFromCookies = () => {
    const match = document.cookie.match(/csrftoken=([^\s;]+)/);
    return match ? match[1] : null;
};

// Interceptor para incluir el token CSRF en las solicitudes
axios.interceptors.request.use(
    (config) => {
        const csrfToken = getCsrfTokenFromCookies();
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Obtener el token CSRF y establecer la cookie csrftoken
export const getCsrfToken = async () => {
    await axios.get(`${API_URL}/get_csrf_token/`);
};

// Iniciar sesión
export const login = async (username: string, password: string) => {
    // Asegurarse de que el token CSRF esté establecido
    await getCsrfToken();

    const response = await axios.post(
        `${API_URL}/login/`,
        { username, password }
        // No es necesario pasar los headers, el interceptor lo hará
    );
    return response.data;
};

// Cerrar sesión
export const logout = async () => {
    // Asegurarse de que el token CSRF esté establecido
    await getCsrfToken();

    await axios.post(`${API_URL}/logout/`, {});
};