from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.workflow import Workflow, WorkflowExecution
from ..schemas.workflow import WorkflowCreate, WorkflowUpdate, WorkflowExecutionCreate, WorkflowExecutionUpdate


class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def get_workflow(self, workflow_id: int) -> Optional[Workflow]:
        return self.db.query(Workflow).filter(Workflow.id == workflow_id).first()

    def get_workflows(self, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Workflow]:
        query = self.db.query(Workflow)
        if user_id:
            query = query.filter(Workflow.user_id == user_id)
        return query.offset(skip).limit(limit).all()

    def create_workflow(self, workflow: WorkflowCreate, user_id: int) -> Workflow:
        db_workflow = Workflow(
            **workflow.model_dump(),
            user_id=user_id
        )
        self.db.add(db_workflow)
        self.db.commit()
        self.db.refresh(db_workflow)
        return db_workflow

    def update_workflow(self, workflow_id: int, workflow: WorkflowUpdate) -> Optional[Workflow]:
        db_workflow = self.get_workflow(workflow_id)
        if not db_workflow:
            return None
        
        update_data = workflow.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_workflow, field, value)
        
        self.db.commit()
        self.db.refresh(db_workflow)
        return db_workflow

    def delete_workflow(self, workflow_id: int) -> bool:
        db_workflow = self.get_workflow(workflow_id)
        if not db_workflow:
            return False
        
        self.db.delete(db_workflow)
        self.db.commit()
        return True

    # 工作流执行相关方法
    def get_execution(self, execution_id: int) -> Optional[WorkflowExecution]:
        return self.db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()

    def get_workflow_executions(
        self, 
        workflow_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[WorkflowExecution]:
        return self.db.query(WorkflowExecution)\
            .filter(WorkflowExecution.workflow_id == workflow_id)\
            .offset(skip).limit(limit).all()

    def create_execution(
        self, 
        execution: WorkflowExecutionCreate, 
        user_id: int
    ) -> WorkflowExecution:
        db_execution = WorkflowExecution(
            **execution.model_dump(),
            user_id=user_id
        )
        self.db.add(db_execution)
        self.db.commit()
        self.db.refresh(db_execution)
        return db_execution

    def update_execution(
        self, 
        execution_id: int, 
        execution: WorkflowExecutionUpdate
    ) -> Optional[WorkflowExecution]:
        db_execution = self.get_execution(execution_id)
        if not db_execution:
            return None
        
        update_data = execution.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_execution, field, value)
        
        self.db.commit()
        self.db.refresh(db_execution)
        return db_execution

    async def execute_workflow(self, workflow_id: int, user_id: int) -> WorkflowExecution:
        """
        执行工作流的主要逻辑
        """
        # 创建执行记录
        execution = self.create_execution(
            WorkflowExecutionCreate(
                workflow_id=workflow_id,
                status="running"
            ),
            user_id=user_id
        )

        try:
            # TODO: 实现实际的工作流执行逻辑
            result = {"message": "Workflow executed successfully"}
            
            # 更新执行状态
            self.update_execution(
                execution.id,
                WorkflowExecutionUpdate(
                    status="completed",
                    result=result,
                    completed_at=datetime.utcnow()
                )
            )
        except Exception as e:
            # 更新执行状态为失败
            self.update_execution(
                execution.id,
                WorkflowExecutionUpdate(
                    status="failed",
                    error_message=str(e),
                    completed_at=datetime.utcnow()
                )
            )
            raise

        return execution 