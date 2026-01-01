import axios from 'axios';

const API_URL = 'http://localhost:8000/api/projects/';

// Create/Analyze a new project
export const analyzeLCA = async (projectData) => {
    try {
        const response = await axios.post(`${API_URL}analyze/`, projectData);
        return response.data;
    } catch (error) {
        console.error("LCA Analysis Error", error);
        throw error;
    }
};

// Fetch list of all past projects
export const getProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}analyze/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching projects", error);
        return [];
    }
};