import axios from 'axios';

// Create an Axios instance
// Assuming the proxy in vite.config.js handles routing to http://localhost:8080
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example Interceptors for Auth
api.interceptors.request.use(
  (config) => {
    // You can attach JWT tokens here from localStorage if you implement JWT
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling (e.g., redirect to login on 401)
    if (error.response && error.response.status === 401) {
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
