from typing import List, Dict, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class ExecutionResponse(BaseModel):
    """Execution response model"""
    id: UUID
    workflow_id: UUID
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    task_results: List[Dict] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 