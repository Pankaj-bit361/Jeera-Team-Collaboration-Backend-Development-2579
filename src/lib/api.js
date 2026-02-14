import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jeera-team-collaboration-backend-de.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token and organization ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (orgId) {
      config.headers.organizationId = orgId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('organizationId');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;