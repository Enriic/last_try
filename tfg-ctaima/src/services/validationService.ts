// src/services/validationService.ts

import axios from 'axios';
import { Validation } from '../types';
import { User } from '../context/AuthContext';

export const getValidations = async (all:boolean, user: User | null): Promise<Validation[]> => {
    const API_URL = 'http://localhost:8000'; // Ajusta la URL según corresponda
    // const endpoint = user?.roles.includes('admin')
    //     ? `${API_URL}/api/validation/`
    //     : `${API_URL}/api/users/${user?.id}/validations/`;

    const endpoint = all? `${API_URL}/api/validation/` : `${API_URL}/api/users/${user?.id}/validations/`;

    const response = await axios.get<Validation[]>(endpoint, {
        withCredentials: true,
    });

    return response.data;
};