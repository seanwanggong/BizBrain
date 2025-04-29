from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_core.core_schema import ValidationInfo
import os


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
    DEBUG: bool = False  # 生产环境默认关闭调试模式

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
    POSTGRES_SERVER: str = "db"  # Docker 服务名
    POSTGRES_USER: str = read_secret("postgres_user", "postgres")
    POSTGRES_PASSWORD: str = read_secret("postgres_password", "postgres")
    POSTGRES_DB: str = read_secret("postgres_db", "bizbrain")
    POSTGRES_PORT: str = "5432"

    DATABASE_URL: Optional[PostgresDsn] = None

    @field_validator("DATABASE_URL", mode='before')
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if isinstance(v, str):
            return v

        return PostgresDsn.build(
            scheme="postgresql",
            username=info.data.get("POSTGRES_USER", "postgres"),
            password=info.data.get("POSTGRES_PASSWORD", "postgres"),
            host=info.data.get("POSTGRES_SERVER", "db"),
            port=int(info.data.get("POSTGRES_PORT", "5432")),
            path=f"/{info.data.get('POSTGRES_DB', 'bizbrain')}"
        )

    # OpenAI settings
    OPENAI_API_KEY: str = read_secret("openai_api_key", "")

    # Token settings
    SECRET_KEY: str = read_secret("secret_key", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"  # JWT encoding algorithm

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
