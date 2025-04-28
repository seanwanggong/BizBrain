export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  documents: KnowledgeDocument[];
  categories: string[];
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'markdown' | 'html';
  content: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  category?: string;
  tags: string[];
  version: number;
}

export interface KnowledgeBaseFormData {
  name: string;
  description: string;
  categories: string[];
}

export interface DocumentUploadFormData {
  name: string;
  type: 'text' | 'pdf' | 'markdown' | 'html';
  content: string;
  metadata?: Record<string, any>;
  category?: string;
  tags?: string[];
} 