from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_core.core_schema import ValidationInfo
import os
import secrets
import logging

# 配置 SQLAlchemy 日志
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
logger = logging.getLogger(__name__)


def read_secret(secret_name: str, default: str = "") -> str:
    """从 Docker secrets、项目 secrets 目录或环境变量读取配置"""
    # 首先尝试从项目的 secrets 目录读取
    try:
        with open(f"secrets/{secret_name}.txt", "r") as f:
            return f.read().strip()
    except (IOError, FileNotFoundError):
        # 然后尝试从 Docker secrets 读取
        try:
            with open(f"/run/secrets/{secret_name}", "r") as f:
                return f.read().strip()
        except (IOError, FileNotFoundError):
            # 最后尝试从环境变量读取
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
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://0.0.0.0:8000"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database settings
    POSTGRES_SERVER: str = read_secret("postgres_server")
    POSTGRES_PORT: str = read_secret("postgres_port")
    POSTGRES_USER: str = read_secret("postgres_user")
    POSTGRES_PASSWORD: str = read_secret("postgres_password")
    POSTGRES_DB: str = read_secret("postgres_db")
    DB_ECHO: bool = True  # 启用 SQL 查询日志

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """构建数据库 URI"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SYNC_SQLALCHEMY_DATABASE_URI(self) -> str:
        """构建同步数据库 URI"""
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # OpenAI settings
    OPENAI_API_KEY: str = read_secret("openai_api_key", "")

    # Token settings
    SECRET_KEY: str = read_secret("secret_key", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"  # JWT encoding algorithm
    FIRST_SUPERUSER_PASSWORD: str = read_secret("first_superuser_password", "admin")

    # JWT settings
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    JWT_ISSUER: str = "bizbrain"
    JWT_AUDIENCE: str = "bizbrain"
    JWT_LEEWAY: int = 60  # 1 minute

    # Password settings
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_MAX_LENGTH: int = 100
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBER: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
logger.info(f"Settings initialized with SECRET_KEY: {settings.SECRET_KEY[:10]}...")
logger.info(f"Using ALGORITHM: {settings.ALGORITHM}")
logger.info(f"API_V1_STR: {settings.API_V1_STR}")
logger.info(f"ACCESS_TOKEN_EXPIRE_MINUTES: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")
logger.info(f"JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
logger.info(f"JWT_ACCESS_TOKEN_EXPIRE_MINUTES: {settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES}")
logger.info(f"JWT_REFRESH_TOKEN_EXPIRE_MINUTES: {settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES}")
logger.info(f"JWT_ISSUER: {settings.JWT_ISSUER}")
logger.info(f"JWT_AUDIENCE: {settings.JWT_AUDIENCE}")
logger.info(f"JWT_LEEWAY: {settings.JWT_LEEWAY}")
logger.info(f"PASSWORD_MIN_LENGTH: {settings.PASSWORD_MIN_LENGTH}")
logger.info(f"PASSWORD_MAX_LENGTH: {settings.PASSWORD_MAX_LENGTH}")
logger.info(f"PASSWORD_REQUIRE_UPPERCASE: {settings.PASSWORD_REQUIRE_UPPERCASE}")
logger.info(f"PASSWORD_REQUIRE_LOWERCASE: {settings.PASSWORD_REQUIRE_LOWERCASE}")
logger.info(f"PASSWORD_REQUIRE_NUMBER: {settings.PASSWORD_REQUIRE_NUMBER}")
logger.info(f"PASSWORD_REQUIRE_SPECIAL: {settings.PASSWORD_REQUIRE_SPECIAL}")
