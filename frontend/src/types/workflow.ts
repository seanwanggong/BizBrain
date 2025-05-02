export type NodeType = 'start' | 'agent' | 'condition' | 'form' | 'action' | 'end';

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  [key: string]: any;
}

export interface FormSchema {
  fields: FormField[];
}

export interface NodeConfig {
  title?: string;
  description?: string;
  formSchema?: FormSchema;
  [key: string]: any;
}

export interface WorkflowNode {
  name: string;
  type: NodeType;
  config: NodeConfig;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  config?: {  // 添加 ? 使字段可选
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      config: Record<string, any>;
      position: { x: number; y: number };
    }>;
    edges: Array<{
      source: string;
      target: string;
      type?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowFormData {
  name: string;
  description: string;
  nodes: Array<{
    type: NodeType;
    name: string;
    config: Record<string, any>;
  }>;
  config?: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      config: Record<string, any>;
      position: { x: number; y: number };
    }>;
    edges: Array<{
      source: string;
      target: string;
      type?: string;
    }>;
  };
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  current_node: string;
  data: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecutionStep {
  id: string;
  execution_id: string;
  node_id: string;
  input: Record<string, any>;
  output: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  created_at: string;
  updated_at: string;
}

export enum TaskType {
  LLM = 'llm',
  API = 'api',
  CONDITION = 'condition',
  LOOP = 'loop',
  PARALLEL = 'parallel',
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  config: Record<string, any>;
  order: number;
  status: TaskStatus;
  result?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  workflow_id: string;
} 