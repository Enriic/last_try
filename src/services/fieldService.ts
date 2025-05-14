import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.validatortwind.site';

export const getFields = async (document_type: number | null) => {
    const response = await axios.get(`${API_URL}/api/documentTypes/${document_type}/fields`, {
        withCredentials: true,
    });
    return response.data;
};