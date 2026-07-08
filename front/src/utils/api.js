import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contratosApi = {
  getAll: (page = 1) => api.get(`/contratos?page=${page}`),
  // Added status and name filters to the getAll method
  getAll: (page = 1, nombre = '', status = '') => 
    api.get(`/contratos?page=${page}&nombre=${nombre}&status=${status}`),
  getById: (id) => api.get(`/contratos/${id}`),
  create: (data) => api.post('/contratos', data),
  update: (id, data) => api.put(`/contratos/${id}`, data),
  remove: (id) => api.delete(`/contratos/${id}`),
  reenviar: (id) => api.post(`/contratos/${id}/reenviar`),
  firmar: (id) => api.patch(`/contratos/${id}/firmar`),
  cancelar: (id) => api.patch(`/contratos/${id}/cancelar`),
};

export default api;
