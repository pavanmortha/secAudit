import axios from 'axios';
import { Asset, Audit, Vulnerability, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Assets API
export const assetsApi = {
  getAll: () => api.get<Asset[]>('/assets'),
  getById: (id: string) => api.get<Asset>(`/assets/${id}`),
  create: (asset: Partial<Asset>) => api.post<Asset>('/assets', asset),
  update: (id: string, asset: Partial<Asset>) => api.put<Asset>(`/assets/${id}`, asset),
  delete: (id: string) => api.delete(`/assets/${id}`),
  scan: (id: string) => api.post(`/assets/${id}/scan`),
};

// Audits API
export const auditsApi = {
  getAll: () => api.get<Audit[]>('/audits'),
  getById: (id: string) => api.get<Audit>(`/audits/${id}`),
  create: (audit: Partial<Audit>) => api.post<Audit>('/audits', audit),
  update: (id: string, audit: Partial<Audit>) => api.put<Audit>(`/audits/${id}`, audit),
  delete: (id: string) => api.delete(`/audits/${id}`),
  start: (id: string) => api.post(`/audits/${id}/start`),
  complete: (id: string) => api.post(`/audits/${id}/complete`),
};

// Vulnerabilities API
export const vulnerabilitiesApi = {
  getAll: () => api.get<Vulnerability[]>('/vulnerabilities'),
  getById: (id: string) => api.get<Vulnerability>(`/vulnerabilities/${id}`),
  create: (vuln: Partial<Vulnerability>) => api.post<Vulnerability>('/vulnerabilities', vuln),
  update: (id: string, vuln: Partial<Vulnerability>) => api.put<Vulnerability>(`/vulnerabilities/${id}`, vuln),
  delete: (id: string) => api.delete(`/vulnerabilities/${id}`),
  bulkUpdate: (updates: Array<{ id: string; data: Partial<Vulnerability> }>) => 
    api.post('/vulnerabilities/bulk-update', { updates }),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (user: Partial<User>) => api.post<User>('/users', user),
  update: (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getActivity: () => api.get('/dashboard/activity'),
  getChartData: () => api.get('/dashboard/charts'),
};

// Reports API
export const reportsApi = {
  generate: (type: string, params: any) => api.post('/reports/generate', { type, params }),
  getAll: () => api.get('/reports'),
  download: (id: string) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

export default api;