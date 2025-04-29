import axios from 'axios';
import { Agent, AgentCreate, AgentUpdate, AgentExecution } from '@/types/agent';
import { Workflow, WorkflowFormData } from '@/types/workflow';
import { User } from '@/types/user';
import {
  LoginResponse,
  RegisterData,
  TaskData,
  ExecutionData,
  KnowledgeBase,
  KnowledgeBaseCreate,
  KnowledgeBaseUpdate,
} from '@/types/api';
import { request } from '@/utils/request';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
export const login = (data: { username: string; password: string }): Promise<LoginResponse> =>
  request<LoginResponse>('/api/auth/login', { method: 'POST', data });

export const register = (data: RegisterData): Promise<User> =>
  request<User>('/api/auth/register', { method: 'POST', data });

// Agent API
export const getAgents = (): Promise<Agent[]> =>
  request<Agent[]>('/api/agents');

export const getAgent = async (id: string): Promise<Agent> => {
  const response = await api.get(`/agents/${id}`);
  return response.data;
};

export const createAgent = (data: AgentCreate): Promise<Agent> =>
  request<Agent>('/api/agents', { method: 'POST', data });

export const updateAgent = (id: string, data: AgentUpdate): Promise<Agent> =>
  request<Agent>(`/api/agents/${id}`, { method: 'PUT', data });

export const deleteAgent = (id: string): Promise<void> =>
  request<void>(`/api/agents/${id}`, { method: 'DELETE' });

export const executeAgent = async (id: string, input: string): Promise<AgentExecution> => {
  const response = await api.post(`/agents/${id}/execute`, { input });
  return response.data;
};

// Workflow API
export const getWorkflows = (): Promise<Workflow[]> =>
  request<Workflow[]>('/api/workflows');

export const getWorkflow = async (id: string): Promise<Workflow> => {
  const response = await api.get(`/workflows/${id}`);
  return response.data;
};

export const createWorkflow = (data: WorkflowFormData): Promise<Workflow> =>
  request<Workflow>('/api/workflows', { method: 'POST', data });

export const updateWorkflow = (id: string, data: WorkflowFormData): Promise<Workflow> =>
  request<Workflow>(`/api/workflows/${id}`, { method: 'PUT', data });

export const deleteWorkflow = (id: string): Promise<void> =>
  request<void>(`/api/workflows/${id}`, { method: 'DELETE' });

export const executeWorkflow = async (id: string, data: Record<string, any>): Promise<ExecutionData> => {
  const response = await api.post(`/workflows/${id}/execute`, data);
  return response.data;
};

// Task API
export const getTasks = (): Promise<TaskData[]> =>
  request<TaskData[]>('/api/tasks');

export const getTask = async (id: string): Promise<TaskData> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = (data: TaskData): Promise<TaskData> =>
  request<TaskData>('/api/tasks', { method: 'POST', data });

export const updateTask = async (workflowId: string, taskId: string, data: Partial<TaskData>): Promise<TaskData> => {
  try {
    const response = await api.put(`/workflows/${workflowId}/tasks/${taskId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '更新任务失败');
  }
};

export const deleteTask = async (workflowId: string, taskId: string): Promise<void> => {
  try {
    await api.delete(`/workflows/${workflowId}/tasks/${taskId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || '删除任务失败');
  }
};

// Execution API
export const getExecutions = (): Promise<ExecutionData[]> =>
  request<ExecutionData[]>('/api/executions');

export const getExecution = async (id: string): Promise<ExecutionData> => {
  const response = await api.get(`/executions/${id}`);
  return response.data;
};

export const getExecutionLogs = async (id: string): Promise<ExecutionData['logs']> => {
  const response = await api.get(`/executions/${id}/logs`);
  return response.data;
};

export const createExecution = (data: ExecutionData): Promise<ExecutionData> =>
  request<ExecutionData>('/api/executions', { method: 'POST', data });

// User API
export const getUsers = (): Promise<User[]> =>
  request<User[]>('/api/users');

export const getCurrentUser = (): Promise<User> =>
  request<User>('/api/users/me');

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Knowledge Base API
export const getKnowledgeBases = (): Promise<KnowledgeBase[]> =>
  request<KnowledgeBase[]>('/api/knowledge-bases');

export const getKnowledgeBase = (id: string): Promise<KnowledgeBase> =>
  request<KnowledgeBase>(`/api/knowledge-bases/${id}`);

export const createKnowledgeBase = (data: KnowledgeBaseCreate): Promise<KnowledgeBase> =>
  request<KnowledgeBase>('/api/knowledge-bases', { method: 'POST', data });

export const updateKnowledgeBase = (id: string, data: KnowledgeBaseUpdate): Promise<KnowledgeBase> =>
  request<KnowledgeBase>(`/api/knowledge-bases/${id}`, { method: 'PUT', data });

export const deleteKnowledgeBase = (id: string): Promise<void> =>
  request<void>(`/api/knowledge-bases/${id}`, { method: 'DELETE' });

export default api; 