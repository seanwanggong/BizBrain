from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import agents
from .core.database import engine, Base

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BizBrain API",
    description="AI Agent协作平台API",
    version="0.1.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to BizBrain API"}

# 注册路由
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])

# 导入路由
# from app.api import workflows, knowledge_base

# 注册路由
# app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
# app.include_router(knowledge_base.router, prefix="/api/v1/knowledge", tags=["knowledge"]) 