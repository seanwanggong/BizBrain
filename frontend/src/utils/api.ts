import axios from 'axios';
import { Agent, AgentCreate, AgentUpdate, AgentExecution, AgentFormData } from '@/types/agent';
import { Workflow, WorkflowFormData, Task, TaskType, TaskStatus } from '@/types/workflow';
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
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
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
  });
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
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
export const login = async (data: { username: string; password: string }): Promise<LoginResponse> => {
  console.log('API login attempt:', { username: data.username });
  try {
    const formData = new URLSearchParams();
    formData.append('username', data.username); // FastAPI OAuth2 expects 'username'
    formData.append('password', data.password);
    
    const response = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: formData.toString(),
    });
    
    console.log('Raw login response:', response);

    // Handle both possible response formats
    const token = typeof response === 'object' ? response.access_token : response;
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('API login successful:', { hasToken: true });
      return {
        access_token: token,
        token_type: 'bearer'
      };
    } else {
      console.error('API login failed: Invalid response format', response);
      throw new Error('Invalid response format from server');
    }
  } catch (error: any) {
    console.error('API login error:', error);
    // If we have a response with an error message, use it
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    // Otherwise throw the original error
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<User> => {
  console.log('API register attempt:', { email: data.email, username: data.username });
  const response = await request<User>('/auth/register', { 
    method: 'POST', 
    data 
  });
  console.log('API register response:', response);
  return response;
};

// Agent API
export const getAgents = (): Promise<Agent[]> =>
  request<Agent[]>('/agents/');

export const getAgent = async (id: string): Promise<Agent> => {
  return request<Agent>(`/agents/${id}`);
};

export const createAgent = (data: AgentFormData): Promise<Agent> =>
  request<Agent>('/agents/', {
    method: 'POST',
    data: {
      name: data.name,
      description: data.description,
      agent_type: data.type,
      config: data.config,
      is_active: true
    }
  });

export const updateAgent = (id: string, data: {
  name: string;
  description: string;
  agent_type: string;
  config: {
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
  };
  is_active: boolean;
}): Promise<Agent> =>
  request<Agent>(`/agents/${id}`, {
    method: 'PUT',
    data: {
      name: data.name,
      description: data.description,
      agent_type: data.agent_type,
      config: {
        model: data.config.model || 'gpt-4',
        systemPrompt: data.config.systemPrompt || '',
        temperature: data.config.temperature || 0.7,
        maxTokens: data.config.maxTokens || 2000,
        tools: data.config.tools || []
      },
      is_active: data.is_active
    }
  });

export const deleteAgent = (id: string): Promise<void> =>
  request<void>(`/agents/${id}`, { method: 'DELETE' });

export const executeAgent = async (id: string, input: string): Promise<AgentExecution> => {
  return request<AgentExecution>(`/agents/${id}/execute/`, {
    method: 'POST',
    data: { input_text: input }
  });
};

// Workflow API
export const getWorkflows = (): Promise<Workflow[]> =>
  request<Workflow[]>('/workflows/');

export const getWorkflow = async (id: string): Promise<Workflow> => {
  return request<Workflow>(`/workflows/${id}/`);
};

export const createWorkflow = (data: WorkflowFormData): Promise<Workflow> =>
  request<Workflow>('/workflows/', { method: 'POST', data });

export const updateWorkflow = (id: string, data: WorkflowFormData): Promise<Workflow> =>
  request<Workflow>(`/workflows/${id}/`, { method: 'PUT', data });

export const deleteWorkflow = (id: string): Promise<void> =>
  request<void>(`/workflows/${id}/`, { method: 'DELETE' });

export const executeWorkflow = async (id: string, data: Record<string, any>): Promise<ExecutionData> => {
  return request<ExecutionData>(`/workflows/${id}/execute/`, {
    method: 'POST',
    data
  });
};

// Task API
interface TaskFilters {
  type?: TaskType;
  status?: TaskStatus;
  workflow_id?: string;
  skip?: number;
  limit?: number;
}
interface CreateTaskRequest {
  name: string;
  description: string;
  type: TaskType;
  agent_id: string;
  workflow_id: string;
  order?: number;
  config?: Record<string, any>;
}
export const getTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  return request<Task[]>('/tasks/', { params: filters });
};

export const getTask = async (id: string): Promise<TaskData> => {
  return request<TaskData>(`/tasks/${id}/`);
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  return request<Task>('/tasks/', {
    method: 'POST',
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      agent_id: data.agent_id,
      workflow_id: data.workflow_id,
      order: data.order || 0,
      config: data.config || {}
    }
  });
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus, error_message?: string): Promise<Task> => {
  return request<Task>(`/tasks/${taskId}/status/`, {
    method: 'PUT',
    data: { status, error_message },
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  return request<void>(`/tasks/${taskId}/`, { method: 'DELETE' });
};

// Execution API
export const getExecutions = async (params?: { skip?: number; limit?: number }): Promise<ExecutionData[]> => {
  return request<ExecutionData[]>('/executions/', { params });
};

export const getExecution = async (id: string): Promise<ExecutionData> => {
  return request<ExecutionData>(`/executions/${id}/`);
};

export const stopExecution = async (id: string): Promise<void> => {
  return request<void>(`/executions/${id}/stop/`, {
    method: 'POST'
  });
};

// User API
export const getUsers = async (): Promise<User[]> => {
  console.log('API fetching users');
  const response = await request<User[]>('/users');
  console.log('API users response:', response);
  return response;
};

export const getCurrentUser = async (): Promise<User> => {
  console.log('API fetching current user');
  const response = await request<User>('/users/me');
  console.log('API current user response:', response);
  return response;
};

export const logout = (): void => {
  console.log('API logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Knowledge Base API
export const getKnowledgeBases = (): Promise<KnowledgeBase[]> =>
  request<KnowledgeBase[]>('/knowledge-bases');

export const getKnowledgeBase = (id: string): Promise<KnowledgeBase> =>
  request<KnowledgeBase>(`/knowledge-bases/${id}`);

export const createKnowledgeBase = (data: KnowledgeBaseCreate): Promise<KnowledgeBase> =>
  request<KnowledgeBase>('/knowledge-bases', { method: 'POST', data });

export const updateKnowledgeBase = (id: string, data: KnowledgeBaseUpdate): Promise<KnowledgeBase> =>
  request<KnowledgeBase>(`/knowledge-bases/${id}`, { method: 'PUT', data });

export const deleteKnowledgeBase = (id: string): Promise<void> =>
  request<void>(`/knowledge-bases/${id}`, { method: 'DELETE' });

export default api; 