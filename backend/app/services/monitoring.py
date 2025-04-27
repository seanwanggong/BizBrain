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
    ExecutionTimeline,
    ErrorAnalysis,
    PerformanceMetrics
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
        
        total_executions = len(tasks)
        successful_executions = sum(1 for t in tasks if t.status == "completed")
        failed_executions = sum(1 for t in tasks if t.status == "failed")
        
        durations = [t.duration for t in tasks if t.duration is not None]
        avg_duration = sum(durations) / len(durations) if durations else 0
        min_duration = min(durations) if durations else 0
        max_duration = max(durations) if durations else 0

        return TaskExecutionStats(
            total_executions=total_executions,
            successful_executions=successful_executions,
            failed_executions=failed_executions,
            average_duration=avg_duration,
            min_duration=min_duration,
            max_duration=max_duration
        )

    def get_task_type_stats(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> TaskTypeStats:
        query = self.db.query(
            WorkflowTask.task_type,
            func.count(WorkflowTask.id).label('count'),
            func.avg(WorkflowTask.duration).label('avg_duration')
        ).group_by(WorkflowTask.task_type)

        if start_time:
            query = query.filter(WorkflowTask.created_at >= start_time)
        if end_time:
            query = query.filter(WorkflowTask.created_at <= end_time)

        results = query.all()
        
        task_type_counts = {r.task_type: r.count for r in results}
        task_type_durations = {r.task_type: r.avg_duration or 0 for r in results}
        
        success_rates = {}
        for task_type in task_type_counts.keys():
            success_count = self.db.query(WorkflowTask).filter(
                WorkflowTask.task_type == task_type,
                WorkflowTask.status == "completed"
            ).count()
            success_rates[task_type] = success_count / task_type_counts[task_type] if task_type_counts[task_type] > 0 else 0

        return TaskTypeStats(
            task_type_counts=task_type_counts,
            task_type_durations=task_type_durations,
            task_type_success_rates=success_rates
        )

    def get_execution_timeline(self, execution_id: int) -> ExecutionTimeline:
        execution = self.db.query(WorkflowExecution).filter(
            WorkflowExecution.id == execution_id
        ).first()
        
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")

        logs = self.db.query(ExecutionLog).filter(
            ExecutionLog.execution_id == execution_id
        ).order_by(ExecutionLog.timestamp).all()

        return ExecutionTimeline(
            execution_id=execution_id,
            logs=logs,
            start_time=execution.started_at,
            end_time=execution.completed_at,
            status=execution.status
        )

    def get_error_analysis(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> ErrorAnalysis:
        query = self.db.query(
            ExecutionLog.error_type,
            func.count(ExecutionLog.id).label('count')
        ).filter(
            ExecutionLog.level == "ERROR"
        ).group_by(ExecutionLog.error_type)

        if start_time:
            query = query.filter(ExecutionLog.timestamp >= start_time)
        if end_time:
            query = query.filter(ExecutionLog.timestamp <= end_time)

        error_counts = {r.error_type: r.count for r in query.all()}
        
        # Get most common errors
        common_errors = self.db.query(
            ExecutionLog.error_message,
            func.count(ExecutionLog.id).label('count')
        ).filter(
            ExecutionLog.level == "ERROR"
        ).group_by(ExecutionLog.error_message).order_by(desc('count')).limit(10).all()
        
        most_common_errors = [
            {"message": r.error_message, "count": r.count}
            for r in common_errors
        ]

        # Get error trends (last 7 days)
        error_trends = {}
        for error_type in error_counts.keys():
            daily_counts = []
            for i in range(7):
                day = datetime.now() - timedelta(days=i)
                count = self.db.query(ExecutionLog).filter(
                    ExecutionLog.error_type == error_type,
                    ExecutionLog.timestamp >= day,
                    ExecutionLog.timestamp < day + timedelta(days=1)
                ).count()
                daily_counts.append(count)
            error_trends[error_type] = daily_counts[::-1]

        return ErrorAnalysis(
            error_counts=error_counts,
            most_common_errors=most_common_errors,
            error_trends=error_trends
        )

    def get_performance_metrics(
        self,
        time_window: int = 7
    ) -> PerformanceMetrics:
        end_time = datetime.now()
        start_time = end_time - timedelta(days=time_window)

        # Get total executions and success rate
        total_executions = self.db.query(WorkflowExecution).filter(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.started_at <= end_time
        ).count()

        successful_executions = self.db.query(WorkflowExecution).filter(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.started_at <= end_time,
            WorkflowExecution.status == "completed"
        ).count()

        success_rate = successful_executions / total_executions if total_executions > 0 else 0

        # Get average execution time
        avg_execution_time = self.db.query(
            func.avg(WorkflowExecution.duration)
        ).filter(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.started_at <= end_time
        ).scalar() or 0

        # Calculate throughput (executions per day)
        throughput = total_executions / time_window

        # Calculate error rate
        error_count = self.db.query(ExecutionLog).filter(
            ExecutionLog.timestamp >= start_time,
            ExecutionLog.timestamp <= end_time,
            ExecutionLog.level == "ERROR"
        ).count()

        error_rate = error_count / total_executions if total_executions > 0 else 0

        # Get response time percentiles
        durations = self.db.query(WorkflowExecution.duration).filter(
            WorkflowExecution.started_at >= start_time,
            WorkflowExecution.started_at <= end_time
        ).all()

        durations = [d[0] for d in durations if d[0] is not None]
        durations.sort()

        percentiles = {
            "p50": durations[int(len(durations) * 0.5)] if durations else 0,
            "p90": durations[int(len(durations) * 0.9)] if durations else 0,
            "p95": durations[int(len(durations) * 0.95)] if durations else 0,
            "p99": durations[int(len(durations) * 0.99)] if durations else 0
        }

        return PerformanceMetrics(
            success_rate=success_rate,
            average_execution_time=avg_execution_time,
            throughput=throughput,
            error_rate=error_rate,
            response_time_percentiles=percentiles
        ) 