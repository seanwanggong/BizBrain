from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text('gen_random_uuid()'))
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=datetime.utcnow)

    # 关联
    workflows = relationship("Workflow", back_populates="user")
    workflow_executions = relationship("WorkflowExecution", back_populates="user")
    knowledge_bases = relationship("KnowledgeBase", back_populates="user")
    documents = relationship("Document", back_populates="user") 