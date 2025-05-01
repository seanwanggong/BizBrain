from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base_class import Base
import uuid
import logging

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