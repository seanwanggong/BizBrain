from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import logging
from sqlalchemy.orm import Session
from ..models.workflow_task import WorkflowTask, TaskStatus
from ..models.task_log import TaskLog
from ..schemas.task_log import TaskLogCreate

logger = logging.getLogger(__name__)

class TaskExecutor:
    def __init__(
        self,
        db: Session,
        max_retries: int = 3,
        retry_delay: int = 5,
        timeout: int = 300
    ):
        self.db = db
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.timeout = timeout

    async def execute_task(
        self,
        task: WorkflowTask,
        input_data: Dict[str, Any],
        execution_id: int
    ) -> Dict[str, Any]:
        """执行任务，包含重试和超时机制"""
        retry_count = 0
        last_error = None

        while retry_count <= self.max_retries:
            try:
                # 记录任务开始
                self._log_task_start(task, execution_id)
                
                # 设置超时
                async with asyncio.timeout(self.timeout):
                    # 更新任务状态
                    task.status = TaskStatus.RUNNING
                    task.started_at = datetime.utcnow()
                    self.db.commit()

                    # 执行任务
                    result = await self._execute_task_internal(task, input_data)

                    # 更新任务状态
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.utcnow()
                    task.result = result
                    self.db.commit()

                    # 记录任务完成
                    self._log_task_complete(task, execution_id, result)
                    return result

            except asyncio.TimeoutError:
                error_msg = f"Task {task.id} timed out after {self.timeout} seconds"
                logger.error(error_msg)
                last_error = error_msg
                self._log_task_error(task, execution_id, error_msg)

            except Exception as e:
                error_msg = str(e)
                logger.error(f"Task {task.id} failed: {error_msg}")
                last_error = error_msg
                self._log_task_error(task, execution_id, error_msg)

            # 重试逻辑
            if retry_count < self.max_retries:
                retry_count += 1
                logger.info(f"Retrying task {task.id} (attempt {retry_count}/{self.max_retries})")
                await asyncio.sleep(self.retry_delay)
            else:
                break

        # 所有重试都失败
        task.status = TaskStatus.FAILED
        task.error_message = last_error
        task.completed_at = datetime.utcnow()
        self.db.commit()
        raise Exception(f"Task {task.id} failed after {self.max_retries} retries: {last_error}")

    async def _execute_task_internal(
        self,
        task: WorkflowTask,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """执行任务的具体实现"""
        # 这里应该根据任务类型调用相应的执行方法
        # 例如：LLM任务、API任务等
        raise NotImplementedError("Task execution not implemented")

    def _log_task_start(self, task: WorkflowTask, execution_id: int):
        """记录任务开始"""
        log = TaskLog(
            task_id=task.id,
            execution_id=execution_id,
            status=TaskStatus.RUNNING,
            message="Task started"
        )
        self.db.add(log)
        self.db.commit()

    def _log_task_complete(
        self,
        task: WorkflowTask,
        execution_id: int,
        result: Dict[str, Any]
    ):
        """记录任务完成"""
        log = TaskLog(
            task_id=task.id,
            execution_id=execution_id,
            status=TaskStatus.COMPLETED,
            message="Task completed successfully",
            result=result
        )
        self.db.add(log)
        self.db.commit()

    def _log_task_error(
        self,
        task: WorkflowTask,
        execution_id: int,
        error_message: str
    ):
        """记录任务错误"""
        log = TaskLog(
            task_id=task.id,
            execution_id=execution_id,
            status=TaskStatus.FAILED,
            message=error_message,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit() 