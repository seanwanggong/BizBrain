from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class KnowledgeBase(Base):
    __tablename__ = "knowledge_bases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    status = Column(String(20), default="draft")  # draft, active, archived
    documents_count = Column(Integer, default=0)
    
    # 关联用户
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="knowledge_bases")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 文档关联
    documents = relationship("Document", back_populates="knowledge_base", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    file_url = Column(String(255))
    file_type = Column(String(50))
    
    # 关联知识库
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_bases.id"))
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
    
    # 关联用户
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="documents")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 