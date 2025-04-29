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
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowFormData {
  name: string;
  description: string;
  nodes: WorkflowNode[];
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