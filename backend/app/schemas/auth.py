from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=1, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None 