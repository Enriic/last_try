import axios from 'axios';
import { API_URL } from '../config';


export const getFields = async (document_type: number | null) => {
    const response = await axios.get(`${API_URL}/api/documentTypes/${document_type}/fields`, {
        withCredentials: true,
    });
    return response.data;
};