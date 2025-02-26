// src/services/utilsService.ts

import axios from 'axios';

const API_URL = import.meta.env.COUNTRIES_API_URL || 'https://restcountries.com/v3.1';

export const getField = async (field: string) => {
    const response = await axios.get(`${API_URL}/all?fields=${field}`, {
        withCredentials: true,
    });
    return response.data;
}

export const getFieldByName = async (name: string, field: string) => {
    const response = await axios.get(`${API_URL}/name/${name}?fields=${field}`, {
        withCredentials: true,
    });
    return response.data;
}