import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data: {
  username: string;
  email: string;
  password: string;
  role: string;
  company_name?: string;
}) => api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const fetchProjects = () => api.get('/projects/list');

export const createProject = (data: {
  title: string;
  description: string;
  status: string;
  start_date: string;
  tech_stack: string[];
  repository_url?: string;
  end_date?: string;
  budget?: number;
}) => api.post('/projects/create', data);

export default api;