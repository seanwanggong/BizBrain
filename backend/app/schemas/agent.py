from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class AgentBase(BaseModel):
    name: str = Field(..., description="Agent名称")
    description: Optional[str] = Field(None, description="Agent描述")
    type: str = Field(..., description="Agent类型")
    config: Dict[str, Any] = Field(default_factory=dict, description="Agent配置")

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AgentExecutionRequest(BaseModel):
    input_text: str = Field(..., description="输入文本")

class AgentExecutionResponse(BaseModel):
    output: str = Field(..., description="输出结果")
    steps: List[Dict[str, Any]] = Field(..., description="执行步骤")
    execution_time: float = Field(..., description="执行时间（秒）") 