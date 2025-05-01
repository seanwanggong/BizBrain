from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_core.core_schema import ValidationInfo
import os
import secrets
import logging

# 配置 SQLAlchemy 日志
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

def read_secret(secret_name: str, default: str = "") -> str:
    """从 Docker secrets 或环境变量读取配置"""
    try:
        with open(f"/run/secrets/{secret_name}", "r") as f:
            return f.read().strip()
    except (IOError, FileNotFoundError):
        return os.getenv(secret_name.upper(), default)


class Settings(BaseSettings):
    PROJECT_NAME: str = "BizBrain"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True  # 开发环境默认开启调试模式

    # Server settings
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: str = "8000"

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_USER: str = read_secret("postgres_user", "morgan")
    POSTGRES_PASSWORD: str = read_secret("postgres_password", "wsg254731051")
    POSTGRES_DB: str = read_secret("postgres_db", "bizbrain")
    DB_ECHO: bool = True  # 启用 SQL 查询日志

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """构建数据库 URI"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # OpenAI settings
    OPENAI_API_KEY: str = read_secret("openai_api_key", "")

    # Token settings
    SECRET_KEY: str = read_secret("secret_key", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"  # JWT encoding algorithm

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
