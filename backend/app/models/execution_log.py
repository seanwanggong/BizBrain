from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base_class import Base

class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    input = Column(String, nullable=False)
    output = Column(String, nullable=False)
    steps = Column(JSON)
    execution_time = Column(Float)
    context = Column(JSON)
    status = Column(String, default="completed")  # completed, failed, timeout
    error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    agent = relationship("Agent", back_populates="execution_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "input": self.input,
            "output": self.output,
            "steps": self.steps,
            "execution_time": self.execution_time,
            "context": self.context,
            "status": self.status,
            "error": self.error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 