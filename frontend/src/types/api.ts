import { Agent, AgentCreate, AgentUpdate, AgentExecution } from './agent';
import { Workflow, WorkflowFormData } from './workflow';
import { User } from './user';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TaskData {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ExecutionData {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
  logs?: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'qa' | 'custom';
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseCreate {
  name: string;
  description: string;
  type: 'document' | 'qa' | 'custom';
  config: Record<string, any>;
}

export interface KnowledgeBaseUpdate {
  name?: string;
  description?: string;
  config?: Record<string, any>;
} 