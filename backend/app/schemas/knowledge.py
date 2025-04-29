from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# Document schemas
class DocumentBase(BaseModel):
    title: str
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None

class Document(DocumentBase):
    id: int
    knowledge_base_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# KnowledgeBase schemas
class KnowledgeBaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "draft"

class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass

class KnowledgeBaseUpdate(KnowledgeBaseBase):
    title: Optional[str] = None
    status: Optional[str] = None

class KnowledgeBase(KnowledgeBaseBase):
    id: int
    user_id: int
    documents_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class KnowledgeBaseDetail(KnowledgeBase):
    documents: List[Document] = [] 