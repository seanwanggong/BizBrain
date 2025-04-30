from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, workflows, agents, tasks, executions, task_logs, monitoring

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])
api_router.include_router(task_logs.router, prefix="/task-logs", tags=["task-logs"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"]) 