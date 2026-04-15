import axios from 'axios';

// Create axios instance with base URL pointing to backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Automatically attach JWT token to every request
// so we dont have to add it manually in every page
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If any request gets 401 (token expired or invalid)
// automatically log the user out and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;