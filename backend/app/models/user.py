from typing import Any, Dict, List, Optional
from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base_class import Base
from app.core.security import get_password_hash
import uuid
import logging
import re

logger = logging.getLogger(__name__)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联 - 使用字符串引用避免循环导入
    workflows = relationship("Workflow", back_populates="user")
    workflow_executions = relationship("WorkflowExecution", back_populates="user")
    agents = relationship("Agent", back_populates="creator")

    @property
    def created_at_str(self) -> str:
        return self.created_at.isoformat() if self.created_at else None

    @property
    def updated_at_str(self) -> str:
        return self.updated_at.isoformat() if self.updated_at else None

    def to_dict(self):
        """Convert model instance to dictionary with formatted datetime"""
        try:
            logger.debug(f"Converting user to dict: {self.id}")
            logger.debug(f"Created at before conversion: {self.created_at}")
            logger.debug(f"Updated at before conversion: {self.updated_at}")
            
            result = {
                "id": str(self.id),
                "username": self.username,
                "email": self.email,
                "is_active": self.is_active,
                "is_superuser": self.is_superuser,
                "created_at": self.created_at.isoformat() if self.created_at else None,
                "updated_at": self.updated_at.isoformat() if self.updated_at else None
            }
            
            logger.debug(f"Serialized result: {result}")
            return result
        except Exception as e:
            logger.error(f"Error in to_dict: {str(e)}", exc_info=True)
            raise

    def __init__(self, **kwargs):
        """Initialize user with password hashing"""
        try:
            logger.debug(f"Initializing user with kwargs: {kwargs}")
            
            # 如果提供了密码，则进行哈希处理
            if 'password' in kwargs:
                password = kwargs.pop('password')
                kwargs['hashed_password'] = get_password_hash(password)
                logger.debug("Password hashed successfully")
            
            # 确保 created_at 和 updated_at 有初始值
            if 'created_at' not in kwargs:
                kwargs['created_at'] = datetime.utcnow()
            if 'updated_at' not in kwargs:
                kwargs['updated_at'] = datetime.utcnow()
            
            logger.debug(f"Final kwargs before super(): {kwargs}")
            super().__init__(**kwargs)
            logger.debug("User initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing user: {str(e)}", exc_info=True)
            raise 