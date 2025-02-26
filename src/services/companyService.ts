// src/services/companyService.ts

import axios from 'axios';
import { CompanyFilterOptions } from '../types/filters';
import { Company, CompanyResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getCompaniesForSelect = async ( page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/companies/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
};

export const getCompanies = async (filters: CompanyFilterOptions | null, page: number | null, pageSize: number | null): Promise<CompanyResponse> => {
    const params: { [key: string]: string | number | null } = {
        page: page || 1,
        page_size: pageSize || 10,
        ...filters
    };

    const response = await axios.get<CompanyResponse>(`${API_URL}/api/companies/`, { params });
    return response.data;
};

export const getCompanyById = async (companyId: string | number | null) => {
    const response = await axios.get(`${API_URL}/api/companies/${companyId}/`, {
        withCredentials: true,
    });
    return response.data;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createCompany = async (company: any) => {
    const response = await axios.post(`${API_URL}/api/companies/`, company, {
        withCredentials: true,
    });
    return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateCompany = async (companyId: string | number | null, company: any) => {
    const response = await axios.put(`${API_URL}/api/companies/${companyId}/`, company, {
        withCredentials: true,
        });
    return response.data;
};