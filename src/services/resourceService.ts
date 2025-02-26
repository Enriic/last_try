// src/services/resourceService.ts

import axios from 'axios';
import { Resource, ResourceResponse } from '../types';

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

// @param type must be a resource type but set in plural. For example: 'vehicles'.
// Maybe will be changed in future so we can use the ResourceType enum
export const getResourcesByType = async (type: string = 'employees', page = 1, pageSize = 10, search = '') => {
    const response = await axios.get<ResourceResponse>(`${API_URL}/api/${type}/`, {
        params: { page, page_size: pageSize, search },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createResource = async (resource: any) => {
    const response = await axios.post(`${API_URL}/api/resources/`, resource, {
        withCredentials: true,
    });
    return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateResource = async (id: string, resource: any) => {
    const response = await axios.put(`${API_URL}/api/resources/${id}/`, resource, {
        withCredentials: true,
    });
    console.log('resource data',resource)
    return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEmployee = async (resource: any) => {
    const response = await axios.post(`${API_URL}/api/employees/`, resource, {
        withCredentials: true,
    });
    return response.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateEmployee = async (id: string, resource: any) => {
    const response = await axios.put(`${API_URL}/api/employees/${id}/`, resource, {
        withCredentials: true,
    });
    console.log('resource data', resource)
    return response.data;
}

