import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

export const login = async (username, password) => {
    const response = await axios.post(API_URL + 'login/', { username, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

export const authHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: 'Token ' + user.token };
    } else {
        return {};
    }
};



// ✅ Add this new function
export const register = async (userData) => {
    return await axios.post(API_URL + 'register/', userData);
};

