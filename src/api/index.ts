import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: `${baseURL}`
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    config.headers['x-auth-token'] = token;
    config.headers['Content-Type'] = 'application/json'; 
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default baseURL;