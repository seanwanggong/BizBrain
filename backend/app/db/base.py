# Import all the models, so that Base has them before being imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.workflow import Workflow  # noqa
from app.models.workflow_task import WorkflowTask  # noqa
from app.models.workflow_execution import WorkflowExecution  # noqa
from app.models.task_log import TaskLog  # noqa
from app.models.execution_log import ExecutionLog  # noqa
from app.models.agent import Agent  # noqa

# This will make sure all models are registered properly
# before being used by Alembic