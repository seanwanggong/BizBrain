from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.workflow import Workflow
from ..models.workflow_execution import WorkflowExecution, ExecutionStatus
from ..models.workflow_task import WorkflowTask, TaskType, TaskStatus
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate
from ..core.database import SessionLocal
from ..core.config import settings
from .llm_service import LLMService
from .task_executors import get_task_executor
import asyncio
import json
from datetime import datetime
import logging


class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = LLMService()
    
    async def execute_workflow(self, workflow_id: int, user_id: int, input_data: Dict[str, Any] = None) -> WorkflowExecution:
        """执行工作流"""
        # 创建工作流执行记录
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            user_id=user_id,
            status="running",
            started_at=datetime.utcnow()
        )
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)
        
        try:
            # 获取工作流及其任务
            workflow = self.db.query(Workflow).filter(Workflow.id == workflow_id).first()
            if not workflow:
                raise ValueError("Workflow not found")
            
            # 获取所有任务
            tasks = self.db.query(WorkflowTask).filter(WorkflowTask.workflow_id == workflow_id).all()
            
            # 构建任务依赖图
            task_graph = self._build_task_graph(tasks)
            
            # 执行任务
            results = await self._execute_tasks(task_graph, input_data, execution.id)
            
            # 更新执行状态
            execution.status = "completed"
            execution.result = results
            execution.completed_at = datetime.utcnow()
            
        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
        
        self.db.commit()
        return execution
    
    def _build_task_graph(self, tasks: List[WorkflowTask]) -> Dict[int, List[int]]:
        """构建任务依赖图"""
        graph = {}
        for task in tasks:
            graph[task.id] = [dep.dependency_id for dep in task.dependencies]
        return graph
    
    async def _execute_tasks(
        self,
        task_graph: Dict[int, List[int]],
        input_data: Dict[str, Any],
        execution_id: int
    ) -> Dict[str, Any]:
        """执行任务图"""
        results = {}
        visited = set()
        
        async def execute_task(task_id: int):
            if task_id in visited:
                return
            
            # 获取任务
            task = self.db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
            if not task:
                raise ValueError(f"Task {task_id} not found")
            
            # 执行依赖任务
            for dep_id in task_graph[task_id]:
                await execute_task(dep_id)
            
            # 获取任务执行器
            executor = get_task_executor(task.task_type, self.db, self.llm_service)
            
            # 执行任务
            result = await executor.execute_task(task, input_data, execution_id)
            results[task_id] = result
            visited.add(task_id)
        
        # 执行所有任务
        for task_id in task_graph:
            await execute_task(task_id)
        
        return results 