import axios from 'axios';
import { Agent, AgentCreate, AgentUpdate, AgentExecution } from '@/types/agent';
import { User } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email: string, password: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '登录失败，请检查邮箱和密码');
  }
};

export const register = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      username: name,
      password,
      is_active: true
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '注册失败，请稍后重试');
  }
};

// Agent API
export const getAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

export const getAgent = async (id: string) => {
  const response = await api.get(`/agents/${id}`);
  return response.data;
};

export const createAgent = async (data: any) => {
  const response = await api.post('/agents', data);
  return response.data;
};

export const updateAgent = async (id: string, data: any) => {
  const response = await api.put(`/agents/${id}`, data);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};

export const executeAgent = async (id: string, input: string) => {
  const response = await api.post(`/agents/${id}/execute`, { input });
  return response.data;
};

// Agent Execution API
export const getAgentExecutions = async (agentId: number): Promise<AgentExecution[]> => {
  const response = await api.get(`/agents/${agentId}/executions`);
  return response.data;
};

export const getAgentExecution = async (agentId: number, executionId: number): Promise<AgentExecution> => {
  const response = await api.get(`/agents/${agentId}/executions/${executionId}`);
  return response.data;
};

// Workflow API
export const getWorkflows = async () => {
  const response = await api.get('/workflows');
  return response.data;
};

export const getWorkflow = async (id: string) => {
  const response = await api.get(`/workflows/${id}`);
  return response.data;
};

export const createWorkflow = async (data: any) => {
  const response = await api.post('/workflows', data);
  return response.data;
};

export const updateWorkflow = async (id: string, data: any) => {
  const response = await api.put(`/workflows/${id}`, data);
  return response.data;
};

export const deleteWorkflow = async (id: string) => {
  const response = await api.delete(`/workflows/${id}`);
  return response.data;
};

export const executeWorkflow = async (id: string, data: any) => {
  const response = await api.post(`/workflows/${id}/execute`, data);
  return response.data;
};

// Task API
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const getTask = async (id: string) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: any) => {
  const response = await api.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: any) => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: string) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// Execution API
export const getExecutions = async () => {
  const response = await api.get('/executions');
  return response.data;
};

export const getExecution = async (id: string) => {
  const response = await api.get(`/executions/${id}`);
  return response.data;
};

export const getExecutionLogs = async (id: string) => {
  const response = await api.get(`/executions/${id}/logs`);
  return response.data;
};

// User API
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default api; 