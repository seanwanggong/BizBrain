from pydantic import BaseModel

class TokenData(BaseModel):
    """Token data schema"""
    email: str | None = None 