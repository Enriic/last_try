// src/services/resourceService.ts

import axios from 'axios';
import { Resource } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getResources = async (): Promise<Resource[]> => {
    const response = await axios.get<Resource[]>(`${API_URL}/api/resources/`, {
        withCredentials: true,
    });
    return response.data;

};

export const getResource = async (id: string) => {
    const response = await axios.get<Resource>(`${API_URL}/api/resources/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export const getResourceById = async (id: string | null) => {
    const response = await axios.get<Resource>(`${API_URL}/api/resources/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export const getResourcesByIds = async (ids: string[]): Promise<Resource[]> => {
    const params = {
        id__in: ids.join(','),
    };
    const response = await axios.get<Resource[]>(`${API_URL}/api/resources/`, { params });
    return response.data;
};

export const getResourcesBySearch = async (page = 1, pageSize = 10, search = '') => {
    const response = await axios.get(`${API_URL}/api/resources/`, {
        params: { page, page_size: pageSize, search },
        withCredentials: true,
    });
    return response.data;
}