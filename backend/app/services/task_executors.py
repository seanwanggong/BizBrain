from typing import Dict, Any
import httpx
from .task_executor import TaskExecutor
from .llm_service import LLMService
from ..models.workflow_task import WorkflowTask, TaskType

class LLMTaskExecutor(TaskExecutor):
    def __init__(self, db, llm_service: LLMService, **kwargs):
        super().__init__(db, **kwargs)
        self.llm_service = llm_service

    async def _execute_task_internal(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
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

class APITaskExecutor(TaskExecutor):
    def __init__(self, db, **kwargs):
        super().__init__(db, **kwargs)
        self.http_client = httpx.AsyncClient()

    async def _execute_task_internal(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
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

class ConditionTaskExecutor(TaskExecutor):
    async def _execute_task_internal(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
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

class LoopTaskExecutor(TaskExecutor):
    async def _execute_task_internal(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
            result = await self.execute_task(loop_task, {**input_data, "item": item}, task.execution_id)
            results.append(result)
        
        return {"results": results}

class ParallelTaskExecutor(TaskExecutor):
    async def _execute_task_internal(self, task: WorkflowTask, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行并行任务"""
        config = task.config or {}
        task_ids = config.get("task_ids", [])
        
        if not task_ids:
            raise ValueError("Task IDs are required")
        
        # 获取所有任务
        tasks = self.db.query(WorkflowTask).filter(WorkflowTask.id.in_(task_ids)).all()
        if len(tasks) != len(task_ids):
            raise ValueError("Some tasks not found")
        
        # 并行执行任务
        results = await asyncio.gather(
            *[self.execute_task(t, input_data, task.execution_id) for t in tasks],
            return_exceptions=True
        )
        
        # 处理结果
        task_results = {}
        for task_id, result in zip(task_ids, results):
            if isinstance(result, Exception):
                task_results[task_id] = {"error": str(result)}
            else:
                task_results[task_id] = result
        
        return {"results": task_results}

def get_task_executor(task_type: TaskType, db, llm_service: LLMService = None) -> TaskExecutor:
    """获取任务执行器"""
    if task_type == TaskType.LLM:
        if not llm_service:
            raise ValueError("LLM service is required for LLM tasks")
        return LLMTaskExecutor(db, llm_service)
    elif task_type == TaskType.API:
        return APITaskExecutor(db)
    elif task_type == TaskType.CONDITION:
        return ConditionTaskExecutor(db)
    elif task_type == TaskType.LOOP:
        return LoopTaskExecutor(db)
    elif task_type == TaskType.PARALLEL:
        return ParallelTaskExecutor(db)
    else:
        raise ValueError(f"Unknown task type: {task_type}") 