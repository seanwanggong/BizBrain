from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=50)

class Token(BaseModel):
    access_token: str
    token_type: str

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )

class TokenPayload(BaseModel):
    sub: Optional[UUID] = None
    exp: Optional[int] = None

class TokenData(BaseModel):
    email: str | None = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    ) 