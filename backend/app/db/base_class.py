from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import MetaData
from sqlalchemy.dialects import postgresql

# PostgreSQL-specific naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)

@as_declarative(metadata=metadata)
class Base:
    id: Any
    __name__: str

    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

def init_models():
    """确保所有模型都被正确加载"""
    from app.models.workflow import Workflow
    from app.models.workflow_task import WorkflowTask
    from app.models.workflow_execution import WorkflowExecution
    from app.models.task_log import TaskLog
    from app.models.execution_log import ExecutionLog
    from app.models.user import User 