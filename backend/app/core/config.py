from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import secrets


class Settings(BaseModel):
    """应用配置"""
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    # 数据库配置
    DATABASE_URL: str = Field(default="sqlite:///./test.db")
    DEBUG: bool = Field(default=True)
    
    # OpenAI配置
    OPENAI_API_KEY: str = Field(default="sk-test-key")
    OPENAI_API_BASE: Optional[str] = Field(default=None)
    OPENAI_API_VERSION: Optional[str] = Field(default=None)
    OPENAI_API_TYPE: Optional[str] = Field(default=None)

    PROJECT_NAME: str = Field(default="BizBrain")
    VERSION: str = Field(default="0.1.0")
    API_V1_STR: str = Field(default="/api/v1")
    
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 8)  # 8 days
    
    POSTGRES_SERVER: str = Field(default="db")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="postgres")
    POSTGRES_DB: str = Field(default="bizbrain")
    SQLALCHEMY_DATABASE_URL: str = Field(default="sqlite:///./bizbrain.db")

    @property
    def get_database_url(self) -> str:
        if self.SQLALCHEMY_DATABASE_URL:
            return self.SQLALCHEMY_DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"


# 创建全局配置实例
settings = Settings() 