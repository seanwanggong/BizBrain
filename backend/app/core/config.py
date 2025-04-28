from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    # 数据库配置
    POSTGRES_SERVER: str = Field(default="db")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_DB: str = Field(default="bizbrain")
    POSTGRES_PORT: str = Field(default="5432")
    DATABASE_URL: str = Field(default="postgresql://postgres:postgres@db:5432/bizbrain")
    DEBUG: bool = Field(default=True)
    
    # OpenAI配置
    OPENAI_API_KEY: str = Field(default="your-api-key")
    OPENAI_API_BASE: Optional[str] = Field(default=None)
    OPENAI_API_VERSION: Optional[str] = Field(default=None)
    OPENAI_API_TYPE: Optional[str] = Field(default=None)

    PROJECT_NAME: str = Field(default="BizBrain")
    VERSION: str = Field(default="0.1.0")
    API_V1_STR: str = Field(default="/api/v1")
    
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = Field(default="HS256")
    
    # API Settings
    DESCRIPTION: str = "BizBrain AI Agent collaboration platform API"
    
    # Documentation Settings
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    OPENAPI_URL: str = "/openapi.json"
    
    # Token Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 8)  # 8 days
    
    @property
    def get_database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


# 创建全局配置实例
settings = Settings() 