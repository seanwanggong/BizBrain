import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.init_db import init_db
from app.api.v1.endpoints import docs

# 导入所有模型以确保它们被正确注册
from app.models.workflow import Workflow
from app.models.workflow_task import WorkflowTask
from app.models.workflow_execution import WorkflowExecution
from app.models.task_log import TaskLog
from app.models.execution_log import ExecutionLog
from app.models.user import User

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 设置 CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(docs.router, prefix=f"{settings.API_V1_STR}/docs", tags=["documentation"])
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    init_db()

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