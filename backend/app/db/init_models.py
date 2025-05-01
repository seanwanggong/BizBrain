from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func

Base = declarative_base()

def init_models():
    """Initialize all SQLAlchemy models."""
    from app.models.user import User
    from app.models.workflow import Workflow
    from app.models.workflow_execution import WorkflowExecution
    from app.models.task_log import TaskLog
    from app.models.execution_log import ExecutionLog
    from app.models.agent import Agent 