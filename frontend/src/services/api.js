import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const analyzeLCA = async (projectData) => {
    try {
        const response = await axios.post(`${API_URL}/projects/analyze/`, projectData);
        return response.data;
    } catch (error) {
        console.error("LCA Analysis Error", error);
        throw error;
    }
};