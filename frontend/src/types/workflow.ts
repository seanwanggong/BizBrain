export interface WorkflowNode {
  id?: string;
  name: string;
  type: 'start' | 'agent' | 'condition' | 'action' | 'end';
  config?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'draft';
}

export interface WorkflowCreate {
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

export interface WorkflowUpdate {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  status?: 'active' | 'inactive' | 'draft';
} 