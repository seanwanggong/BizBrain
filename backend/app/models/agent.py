from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime, UniqueConstraint, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Agent(Base):
    __tablename__ = "agents"
    __table_args__ = (
        UniqueConstraint('name', name='uq_agents_name'),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    type = Column(String, nullable=False)
    config = Column(JSON, nullable=False, default={})
    is_active = Column(Boolean, default=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联关系 - 使用字符串引用避免循环导入
    creator = relationship("User", back_populates="agents")
    execution_logs = relationship("ExecutionLog", back_populates="agent", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        print("=== Agent.__init__ called ===")
        print(f"Received kwargs: {kwargs}")
        
        # 确保所有必需的字段都存在
        required_fields = ['name', 'description', 'type', 'config', 'creator_id']
        for field in required_fields:
            if field not in kwargs:
                print(f"Missing required field: {field}")
                raise ValueError(f"Missing required field: {field}")
        
        # 确保 updated_at 有初始值
        if 'updated_at' not in kwargs:
            kwargs['updated_at'] = func.now()
        
        print(f"Final kwargs before super(): {kwargs}")
        super().__init__(**kwargs)
        print("=== Agent.__init__ completed ===")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'config': self.config,
            'is_active': self.is_active,
            'creator_id': str(self.creator_id) if self.creator_id else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 