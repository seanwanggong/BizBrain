from fastapi import APIRouter
from .endpoints import workflows, tasks, executions, task_logs, monitoring, agents

api_router = APIRouter()

api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])
api_router.include_router(task_logs.router, prefix="/task-logs", tags=["task-logs"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"]) 