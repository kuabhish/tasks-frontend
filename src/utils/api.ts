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

// Auth
export const register = (data: {
  username: string;
  email: string;
  password: string;
  role: string;
  company_name?: string;
}) => api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

// Projects
export const fetchProjects = () => api.get('/projects/list');

export const createProject = (data: {
  title: string;
  description?: string;
  status?: string;
  start_date?: string;
  tech_stack?: string[];
  repository_url?: string;
  end_date?: string;
  budget?: number;
}) => api.post('/projects/create', data);

// Tasks
export const fetchTasks = (projectId?: string) =>
  api.get('/tasks/list', { params: { project_id: projectId } });

export const createTask = (data: {
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  project_id: string;
  category_id?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
  actual_duration?: number;
}) => api.post('/tasks/create', data);

export const updateTask = (taskId: string, data: {
  title?: string;
  description?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  category_id?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
  actual_duration?: number;
}) => api.put(`/tasks/update/${taskId}`, data);

export const deleteTask = (taskId: string) => api.delete(`/tasks/delete/${taskId}`);

// Subtasks
export const createSubtask = (data: {
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  task_id: string;
  assigned_user_id?: string;
  assigned_team_id?: string;
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
}) => api.post('/tasks/subtasks/create', data);

export const updateSubtask = (subtaskId: string, data: {
  title?: string;
  description?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  assigned_user_id?: string;
  assigned_team_id?: string;
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
}) => api.put(`/tasks/subtasks/update/${subtaskId}`, data);

export const deleteSubtask = (subtaskId: string) => api.delete(`/tasks/subtasks/delete/${subtaskId}`);

// Time Entries
export const fetchTimeEntries = (params: {
  project_id?: string;
  start_date?: string;
  end_date?: string;
}) => api.get('/time-entries/list', { params });

export const createTimeEntry = (data: {
  subtask_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes?: string;
}) => api.post('/time-entries/create', data);

// Teams
export const createTeam = (data: {
  name: string;
  description?: string;
}) => api.post('/teams/create', data);

export const fetchTeams = () => api.get('/teams/list');

export const addTeamMember = (teamId: string, data: { user_id: string }) =>
  api.post(`/teams/${teamId}/members`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  api.delete(`/teams/${teamId}/members/${userId}`);

// Users
export const fetchUsers = () => api.get('/users/list');

export const fetchUser = (userId: string) => api.get(`/users/${userId}`);

export default api;