import axios from 'axios';

//export const API_BASE = 'http://localhost:5000';
export const API_BASE = 'https://thebushcollection.onrender.com/';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});
//hello
export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const initAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) setAuthToken(token);
  } catch (err) {
    // ignore in non-browser environments
  }
};

// Add request interceptor to ensure auth token is always present
api.interceptors.request.use(
  (config) => {
    // Before each request, ensure token is set from localStorage
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
