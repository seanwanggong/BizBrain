export interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
  is_active: boolean;
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  type?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentExecutionStep {
  id: string;
  execution_id: string;
  step_type: string;
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentExecutionRequest {
  input_text: string;
}

export interface AgentExecutionResponse {
  output: string;
  steps: Array<Record<string, any>>;
  execution_time: number;
} 