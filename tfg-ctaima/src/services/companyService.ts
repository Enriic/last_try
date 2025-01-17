import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


export const getCompanies = async () => {
    const response = await axios.get(`${API_URL}/api/companies/`, {
        withCredentials: true,
    });
    return response.data;
};