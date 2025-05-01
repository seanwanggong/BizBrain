from pydantic import BaseModel, EmailStr, computed_field
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: UUID
    is_superuser: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @computed_field
    @property
    def created_at_str(self) -> Optional[str]:
        return self.created_at if self.created_at else None

    @computed_field
    @property
    def updated_at_str(self) -> Optional[str]:
        return self.updated_at if self.updated_at else None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        } 