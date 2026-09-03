import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('care_slot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const clinicId = localStorage.getItem('care_slot_clinic_id');
    if (clinicId && !config.headers['X-Clinic-Id']) {
      config.headers['X-Clinic-Id'] = clinicId;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('care_slot_token');
      localStorage.removeItem('care_slot_user');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
