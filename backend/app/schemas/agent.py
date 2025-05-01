from typing import Optional, Dict, Any, List, UUID
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class AgentBase(BaseModel):
    name: str = Field(..., description="Agent名称")
    description: Optional[str] = Field(None, description="Agent描述")
    type: str = Field(..., description="Agent类型", alias="agent_type")
    config: Dict[str, Any] = Field(default_factory=dict, description="Agent配置")

class AgentConfig(BaseModel):
    model: str
    systemPrompt: str
    temperature: float
    maxTokens: int
    tools: List[str]

class AgentCreate(BaseModel):
    name: str
    description: str
    type: str = Field(..., alias="agent_type")
    config: Dict[str, Any] = Field(default_factory=dict, description="Agent配置")
    is_active: bool = True

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = Field(None, alias="agent_type")
    config: Optional[AgentConfig] = None
    is_active: Optional[bool] = None

class AgentResponse(BaseModel):
    id: int
    name: str
    description: str
    type: str = Field(..., alias="agent_type")
    config: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    creator_id: UUID

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }

class AgentInDB(AgentCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AgentExecutionRequest(BaseModel):
    input_text: str

class AgentExecutionResponse(BaseModel):
    output: str
    steps: List[Dict[str, Any]]
    execution_time: float 