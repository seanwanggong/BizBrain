export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 'assistant' | 'expert' | 'task' | 'chain';

export interface TemplateFormData {
  industry: string;
  role: string;
  tone: string;
  goal: string;
  responsibilities: string;
  focus: string;
  principles: string;
  additionalInfo?: string;
}

export interface AgentFormData {
  name: string;
  description: string;
  type: AgentType;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}

export const AGENT_TYPES = [
  { label: '通用助手', value: 'assistant', description: '可以处理各种任务的通用AI助手' },
  { label: '领域专家', value: 'expert', description: '在特定领域具有专业知识的AI专家' },
  { label: '任务执行', value: 'task', description: '专注于执行特定任务的AI代理' },
  { label: 'Agent链', value: 'chain', description: '多个Agent协同工作的任务链' },
];

export const MODEL_OPTIONS = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
  { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
];

export const TOOL_OPTIONS = [
  { label: '网页浏览', value: 'web_browser', description: '浏览和抓取网页内容' },
  { label: '文件读写', value: 'file_io', description: '读取和写入文件' },
  { label: 'API调用', value: 'api_call', description: '调用外部API服务' },
  { label: '代码执行', value: 'code_interpreter', description: '执行和分析代码' },
  { label: '数据库操作', value: 'database', description: '执行数据库查询和操作' },
  { label: '知识库检索', value: 'knowledge_base', description: '搜索和检索知识库内容' },
];

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