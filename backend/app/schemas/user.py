from pydantic import BaseModel, EmailStr, computed_field, Field, ConfigDict, validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re
from app.core.config import settings

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=50)
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=settings.PASSWORD_MIN_LENGTH,
        max_length=settings.PASSWORD_MAX_LENGTH
    )
    
    @validator('password')
    def validate_password(cls, v):
        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if settings.PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if settings.PASSWORD_REQUIRE_NUMBER and not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(UserBase):
    password: Optional[str] = Field(
        None,
        min_length=settings.PASSWORD_MIN_LENGTH,
        max_length=settings.PASSWORD_MAX_LENGTH
    )

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

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    ) 