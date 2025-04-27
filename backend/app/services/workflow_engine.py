from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.workflow import Workflow, WorkflowExecution
from ..models.workflow_task import WorkflowTask, TaskType, TaskStatus
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate
from ..core.database import SessionLocal
from ..core.config import settings
from .llm_service import LLMService
import asyncio
import json
import httpx
from datetime import datetime


class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db
        self.http_client = httpx.AsyncClient()
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
            results = await self._execute_tasks(task_graph, input_data)
            
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
    
    async def _execute_tasks(self, task_graph: Dict[int, List[int]], input_data: Dict[str, Any]) -> Dict[str, Any]:
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
            
            # 更新任务状态
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.utcnow()
            self.db.commit()
            
            try:
                # 执行任务
                if task.task_type == TaskType.LLM:
                    result = await self._execute_llm_task(task, input_data)
                elif task.task_type == TaskType.API:
                    result = await self._execute_api_task(task, input_data)
                elif task.task_type == TaskType.CONDITION:
                    result = await self._execute_condition_task(task, input_data)
                elif task.task_type == TaskType.LOOP:
                    result = await self._execute_loop_task(task, input_data)
                elif task.task_type == TaskType.PARALLEL:
                    result = await self._execute_parallel_task(task, input_data)
                else:
                    raise ValueError(f"Unknown task type: {task.task_type}")
                
                # 更新任务状态
                task.status = TaskStatus.COMPLETED
                task.result = result
                task.completed_at = datetime.utcnow()
                results[task_id] = result
                
            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error_message = str(e)
                task.completed_at = datetime.utcnow()
                raise
            
            self.db.commit()
            visited.add(task_id)
        
        # 执行所有任务
        for task_id in task_graph:
            await execute_task(task_id)
        
        return results
    
    async def _execute_llm_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行LLM任务"""
        config = task.config or {}
        operation = config.get("operation")
        model = config.get("model", "gpt-3.5-turbo")
        temperature = config.get("temperature", 0.7)
        max_tokens = config.get("max_tokens", 1000)
        
        if not operation:
            raise ValueError("LLM operation is required")
        
        # 获取输入文本
        input_text = input_data.get("text", "")
        if not input_text:
            raise ValueError("Input text is required")
        
        try:
            # 根据操作类型执行不同的LLM任务
            if operation == "completion":
                result = await self.llm_service.generate_completion(
                    prompt=input_text,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
            elif operation == "embedding":
                result = await self.llm_service.generate_embeddings(
                    text=input_text,
                    model=model
                )
            elif operation == "sentiment":
                result = await self.llm_service.analyze_sentiment(
                    text=input_text,
                    model=model
                )
            elif operation == "entities":
                result = await self.llm_service.extract_entities(
                    text=input_text,
                    model=model
                )
            elif operation == "summary":
                max_length = config.get("max_length", 200)
                result = await self.llm_service.summarize_text(
                    text=input_text,
                    model=model,
                    max_length=max_length
                )
            else:
                raise ValueError(f"Unknown LLM operation: {operation}")
            
            return {
                "operation": operation,
                "model": model,
                "result": result
            }
            
        except Exception as e:
            raise ValueError(f"LLM task execution failed: {str(e)}")
    
    async def _execute_api_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行API任务"""
        config = task.config or {}
        url = config.get("url")
        method = config.get("method", "GET")
        headers = config.get("headers", {})
        body = config.get("body", {})
        
        if not url:
            raise ValueError("API URL is required")
        
        try:
            response = await self.http_client.request(
                method=method,
                url=url,
                headers=headers,
                json=body
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise ValueError(f"API request failed: {str(e)}")
    
    async def _execute_condition_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行条件任务"""
        config = task.config or {}
        condition = config.get("condition")
        true_branch = config.get("true_branch")
        false_branch = config.get("false_branch")
        
        if not condition:
            raise ValueError("Condition is required")
        
        # 评估条件
        try:
            result = eval(condition, {"input": input_data})
        except Exception as e:
            raise ValueError(f"Condition evaluation failed: {str(e)}")
        
        return {
            "condition": condition,
            "result": result,
            "branch": true_branch if result else false_branch
        }
    
    async def _execute_loop_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行循环任务"""
        config = task.config or {}
        items = config.get("items", [])
        loop_task_id = config.get("loop_task_id")
        
        if not loop_task_id:
            raise ValueError("Loop task ID is required")
        
        results = []
        for item in items:
            # 获取循环任务
            loop_task = self.db.query(WorkflowTask).filter(WorkflowTask.id == loop_task_id).first()
            if not loop_task:
                raise ValueError(f"Loop task {loop_task_id} not found")
            
            # 执行循环任务
            result = await self._execute_task(loop_task, {**input_data, "item": item})
            results.append(result)
        
        return {
            "items": items,
            "results": results
        }
    
    async def _execute_parallel_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行并行任务"""
        config = task.config or {}
        task_ids = config.get("task_ids", [])
        
        if not task_ids:
            raise ValueError("Task IDs are required")
        
        # 获取并行任务
        tasks = self.db.query(WorkflowTask).filter(WorkflowTask.id.in_(task_ids)).all()
        if len(tasks) != len(task_ids):
            raise ValueError("Some tasks not found")
        
        # 并行执行任务
        results = await asyncio.gather(*[
            self._execute_task(task, input_data)
            for task in tasks
        ])
        
        return {
            "task_ids": task_ids,
            "results": results
        }
    
    async def _execute_task(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行单个任务"""
        if task.task_type == TaskType.LLM:
            return await self._execute_llm_task(task, input_data)
        elif task.task_type == TaskType.API:
            return await self._execute_api_task(task, input_data)
        elif task.task_type == TaskType.CONDITION:
            return await self._execute_condition_task(task, input_data)
        elif task.task_type == TaskType.LOOP:
            return await self._execute_loop_task(task, input_data)
        elif task.task_type == TaskType.PARALLEL:
            return await self._execute_parallel_task(task, input_data)
        else:
            raise ValueError(f"Unknown task type: {task.task_type}") 