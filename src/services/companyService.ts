// src/services/companyService.ts

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getCompanies = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/companies/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
};