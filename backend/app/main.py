from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.api import api_router
from .core.config import settings
from .core.database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url=settings.DOCS_URL,
    redoc_url=settings.REDOC_URL,
    openapi_url=settings.OPENAPI_URL,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

# Include routers
from .api.v1.endpoints import auth, agents, workflows, tasks, executions

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(agents.router, prefix=f"{settings.API_V1_STR}/agents", tags=["agents"])
app.include_router(workflows.router, prefix=f"{settings.API_V1_STR}/workflows", tags=["workflows"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(executions.router, prefix=f"{settings.API_V1_STR}/executions", tags=["executions"])

# 导入路由
# from app.api import workflows, knowledge_base

# 注册路由
# app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
# app.include_router(knowledge_base.router, prefix="/api/v1/knowledge", tags=["knowledge"]) 