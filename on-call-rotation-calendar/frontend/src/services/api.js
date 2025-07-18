import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Collaborators API
export const collaboratorsAPI = {
  getAll: () => api.get('/collaborators'),
  getById: (id) => api.get(`/collaborators/${id}`),
  create: (collaboratorData) => api.post('/collaborators', collaboratorData),
  update: (id, collaboratorData) => api.put(`/collaborators/${id}`, collaboratorData),
  delete: (id) => api.delete(`/collaborators/${id}`),
  getAvailability: (id) => api.get(`/collaborators/${id}/availability`),
  updateAvailability: (id, availabilityData) => api.put(`/collaborators/${id}/availability`, availabilityData),
};

// Schedules API
export const schedulesAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (scheduleData) => api.post('/schedules', scheduleData),
  update: (id, scheduleData) => api.put(`/schedules/${id}`, scheduleData),
  delete: (id) => api.delete(`/schedules/${id}`),
  generate: (params) => api.post('/schedules/generate', params),
  getProposals: (scheduleId) => api.get(`/schedules/${scheduleId}/proposals`),
  acceptProposal: (scheduleId, proposalId) => api.post(`/schedules/${scheduleId}/proposals/${proposalId}/accept`),
  rejectProposal: (scheduleId, proposalId, feedback) => api.post(`/schedules/${scheduleId}/proposals/${proposalId}/reject`, { feedback }),
  publish: (scheduleId, platform) => api.post(`/schedules/${scheduleId}/publish`, { platform }),
};

// Statistics API
export const statisticsAPI = {
  getCollaboratorStats: (params) => api.get('/statistics/collaborators', { params }),
  getShiftDistribution: (params) => api.get('/statistics/shifts', { params }),
  getHistoricalData: (params) => api.get('/statistics/historical', { params }),
};

export default api;