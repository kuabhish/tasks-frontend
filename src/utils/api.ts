import axios, { AxiosError } from 'axios';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { Project } from '../types/project';
import { Task, Subtask, TimeEntry } from '../types/task';
import { Team } from '../types/team';
import { User } from '../types/user';

// const API_URL_V1 = 'http://127.0.0.1:5000/api/v1';
const API_URL_V1 = 'https://easelake.com/api/v1';

const api = axios.create({
  baseURL: API_URL_V1,
});

/**
 * Interceptor to add auth token to requests
 */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor to handle 401 errors and refresh token
 */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token: currentToken } = useAuthStore.getState();
        const response = await axios.post(`${API_URL_V1}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const newToken = response.data.data.token;
        useAuthStore.getState().setToken(newToken); // Update token in store
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        isRefreshing = false;
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout(); // Clear auth store
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    return handleApiError(error);
  }
);

/**
 * Centralized error handler
 */
const handleApiError = (error: AxiosError): never => {
  const message = (error.response?.data as any)?.message || 'An unexpected error occurred';
  toast.error(message);
  throw error;
};

// Auth
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
  company_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  try {
    return await api.post('/auth/register', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const login = async (data: LoginData) => {
  try {
    return await api.post('/auth/login', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Projects
export const fetchProjects = async () => {
  try {
    return await api.get<{ data: Project[] }>('/projects/list');
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const createProject = async (data: any) => {
  try {
    return await api.post<{ data: { project: Project } }>('/projects/create', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const updateProject = async (projectId: string, data: Partial<any>) => {
  try {
    return await api.put<{ data: { project: Project } }>(`/projects/update/${projectId}`, data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    return await api.delete<{ data: { message: string } }>(`/projects/archive/${projectId}`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Tasks
export interface CreateTaskData {
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
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  category_id?: string;
  priority?: 'Low' | 'Medium' | 'High';
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
  actual_duration?: number;
}

export const fetchTasks = async (projectId?: string) => {
  try {
    return await api.get<{ data: Task[] }>('/tasks/list', { params: { project_id: projectId } });
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const createTask = async (data: CreateTaskData) => {
  try {
    return await api.post<{ data: { task: Task } }>('/tasks/create', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const updateTask = async (taskId: string, data: UpdateTaskData) => {
  try {
    return await api.put<{ data: { task: Task } }>(`/tasks/update/${taskId}`, data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    return await api.delete<{ data: { message: string } }>(`/tasks/delete/${taskId}`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};



export const createSubtask = async (data: any) => {
  try {
    return await api.post<{ data: { subtask: Subtask } }>('/tasks/subtasks/create', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const updateSubtask = async (subtaskId: string, data: any) => {
  try {
    return await api.put<{ data: { subtask: Subtask } }>(`/tasks/subtasks/update/${subtaskId}`, data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const deleteSubtask = async (subtaskId: string) => {
  try {
    return await api.delete<{ data: { message: string } }>(`/tasks/subtasks/delete/${subtaskId}`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Time Entries
export interface FetchTimeEntriesParams {
  project_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateTimeEntryData {
  subtask_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes?: string;
}

export interface UpdateTimeEntryData {
  subtask_id?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  notes?: string;
}

export const fetchTimeEntries = async (params: FetchTimeEntriesParams) => {
  try {
    return await api.get<{ data: TimeEntry[] }>('/time-entries/list', { params });
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const createTimeEntry = async (data: CreateTimeEntryData) => {
  try {
    return await api.post<{ data: { timeEntry: TimeEntry } }>('/time-entries/create', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const updateTimeEntry = async (timeEntryId: string, data: UpdateTimeEntryData) => {
  try {
    return await api.put<{ data: { timeEntry: TimeEntry } }>(`/time-entries/update/${timeEntryId}`, data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Teams
export interface CreateTeamData {
  name: string;
  description?: string;
}

export const fetchTeams = async () => {
  try {
    return await api.get<{ data: Team[] }>('/teams/list');
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const createTeam = async (data: CreateTeamData) => {
  try {
    return await api.post<{ data: { team: Team } }>('/teams/create', data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const addTeamMember = async (teamId: string, data: { user_id: string }) => {
  try {
    return await api.post<{ data: { member: { teamId: string; userId: string } } }>(`/teams/${teamId}/members`, data);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  try {
    return await api.delete<{ data: { message: string } }>(`/teams/${teamId}/members/${userId}`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Users
export const fetchUsers = async () => {
  try {
    return await api.get<{ data: User[] }>('/users/list');
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const fetchUser = async (userId: string) => {
  try {
    return await api.get<{ data: User }>(`/users/${userId}`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const fetchProjectStats = async (projectId: string) => {
  try {
    return await api.get<{ data: { total_tasks: number; total_subtasks: number; completed_subtasks: number; completion_rate: number } }>(`/projects/${projectId}/stats`);
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export default api;