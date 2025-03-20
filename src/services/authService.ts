// src/services/authService.ts

import axios from 'axios';

// Configura Axios para enviar cookies en cada petición
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL || 'https://api.validatortwind.site';
let csrfToken: string | null = null;

// Función para obtener el token CSRF de las cookies
// const getCsrfTokenFromCookies = () => {
//     const match = document.cookie.match(/csrftoken=([^\s;]+)/);
//     return match ? match[1] : null;
// };

// Interceptor para incluir el token CSRF en las solicitudes
axios.interceptors.request.use(
    (config) => {
        // const csrfToken = getCsrfTokenFromCookies();
        // console.log('csrfToken', csrfToken);
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
    const response = await axios.get(`${API_URL}/get_csrf_token/`, {
        withCredentials: true, // importante para que Django asocie la sesión si es necesario
    });
    csrfToken = response.data.csrfToken;
    console.log('CSRF token obtenido:', csrfToken);
};

// Iniciar sesión
export const login = async (username: string, password: string) => {
    // Asegurarse de que el token CSRF esté establecido
    await getCsrfToken();

    const response = await axios.post(
        `${API_URL}/login/`,
        { username, password },
        { withCredentials: true }
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