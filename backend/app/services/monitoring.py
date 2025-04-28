from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from ..models.task_log import TaskLog
from ..models.workflow_task import TaskStatus, TaskType
from ..models.workflow_execution import ExecutionStatus
from app.models.workflow_task import WorkflowTask
from app.models.workflow_execution import WorkflowExecution
from app.models.execution_log import ExecutionLog
from app.schemas.monitoring import (
    TaskExecutionStats,
    TaskTypeStats,
    WorkflowExecutionStats,
    SystemStats,
    MonitoringStats
)

class MonitoringService:
    def __init__(self, db: Session):
        self.db = db

    def get_task_execution_stats(
        self,
        task_id: Optional[int] = None,
        execution_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> TaskExecutionStats:
        query = self.db.query(WorkflowTask)
        
        if task_id:
            query = query.filter(WorkflowTask.id == task_id)
        if execution_id:
            query = query.filter(WorkflowTask.execution_id == execution_id)
        if start_time:
            query = query.filter(WorkflowTask.created_at >= start_time)
        if end_time:
            query = query.filter(WorkflowTask.created_at <= end_time)

        tasks = query.all()
        
        total_tasks = len(tasks)
        completed_tasks = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
        failed_tasks = sum(1 for t in tasks if t.status == TaskStatus.FAILED)
        pending_tasks = sum(1 for t in tasks if t.status == TaskStatus.PENDING)
        running_tasks = sum(1 for t in tasks if t.status == TaskStatus.RUNNING)
        
        # 计算每种任务类型的统计信息
        task_type_stats = {}
        for task_type in TaskType:
            type_tasks = [t for t in tasks if t.task_type == task_type]
            if type_tasks:
                durations = [
                    (t.completed_at - t.started_at).total_seconds()
                    for t in type_tasks
                    if t.completed_at and t.started_at
                ]
                avg_duration = sum(durations) / len(durations) if durations else None
                task_type_stats[task_type] = TaskTypeStats(
                    task_type=task_type.value,
                    total_count=len(type_tasks),
                    success_count=sum(1 for t in type_tasks if t.status == TaskStatus.COMPLETED),
                    failure_count=sum(1 for t in type_tasks if t.status == TaskStatus.FAILED),
                    average_duration=avg_duration
                )

        # 计算总体平均执行时间
        all_durations = [
            (t.completed_at - t.started_at).total_seconds()
            for t in tasks
            if t.completed_at and t.started_at
        ]
        average_duration = sum(all_durations) / len(all_durations) if all_durations else None

        return TaskExecutionStats(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            failed_tasks=failed_tasks,
            pending_tasks=pending_tasks,
            running_tasks=running_tasks,
            average_duration=average_duration,
            by_type=list(task_type_stats.values())
        )

    def get_workflow_execution_stats(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> WorkflowExecutionStats:
        query = self.db.query(WorkflowExecution)
        
        if start_time:
            query = query.filter(WorkflowExecution.created_at >= start_time)
        if end_time:
            query = query.filter(WorkflowExecution.created_at <= end_time)

        executions = query.all()
        
        total_executions = len(executions)
        completed_executions = sum(1 for e in executions if e.status == ExecutionStatus.COMPLETED)
        failed_executions = sum(1 for e in executions if e.status == ExecutionStatus.FAILED)
        pending_executions = sum(1 for e in executions if e.status == ExecutionStatus.PENDING)
        running_executions = sum(1 for e in executions if e.status == ExecutionStatus.RUNNING)
        
        # 计算平均执行时间
        durations = [
            (e.completed_at - e.started_at).total_seconds()
            for e in executions
            if e.completed_at and e.started_at
        ]
        average_duration = sum(durations) / len(durations) if durations else None

        return WorkflowExecutionStats(
            total_executions=total_executions,
            completed_executions=completed_executions,
            failed_executions=failed_executions,
            pending_executions=pending_executions,
            running_executions=running_executions,
            average_duration=average_duration
        )

    def get_system_stats(self) -> SystemStats:
        # 这里应该使用实际的系统监控工具来获取这些指标
        # 这里只是返回示例数据
        return SystemStats(
            cpu_usage=50.0,
            memory_usage=60.0,
            disk_usage=40.0,
            uptime=3600.0  # 1小时
        )

    def get_monitoring_stats(self) -> MonitoringStats:
        task_stats = self.get_task_execution_stats()
        workflow_stats = self.get_workflow_execution_stats()
        system_stats = self.get_system_stats()

        return MonitoringStats(
            task_stats=task_stats,
            workflow_stats=workflow_stats,
            system_stats=system_stats,
            updated_at=datetime.now()
        ) 