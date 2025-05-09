import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.init_db import init_db
from app.api.v1.endpoints import docs

# 配置根日志记录器
root_logger = logging.getLogger()
root_logger.setLevel(logging.DEBUG)

# 添加控制台处理器
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
root_logger.addHandler(console_handler)

# 配置 SQLAlchemy 日志
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# 设置 CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"]
    )

app.include_router(docs.router, prefix=f"{settings.API_V1_STR}/docs", tags=["documentation"])
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    logging.info("Starting up application...")
    await init_db()
    logging.info("Application startup complete")

@app.get("/")
async def root():
    return {}

# Include routers
from .api.v1.endpoints import auth, users, agents, workflows, tasks, executions

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(agents.router, prefix=f"{settings.API_V1_STR}/agents", tags=["agents"])
app.include_router(workflows.router, prefix=f"{settings.API_V1_STR}/workflows", tags=["workflows"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(executions.router, prefix=f"{settings.API_V1_STR}/executions", tags=["executions"])

# 导入路由
# from app.api import workflows, knowledge_base

# 注册路由
# app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
# app.include_router(knowledge_base.router, prefix="/api/v1/knowledge", tags=["knowledge"]) 