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