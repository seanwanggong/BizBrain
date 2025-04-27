from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.workflow import Workflow
from ...models.workflow_task import WorkflowTask, TaskType, TaskStatus
from ...schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowTaskCreate,
    WorkflowTaskUpdate,
    WorkflowTaskResponse,
    WorkflowExecutionResponse
)
from ...services.workflow_engine import WorkflowEngine

router = APIRouter()


@router.post("/", response_model=WorkflowResponse)
async def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db)
):
    """创建工作流"""
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        config=workflow.config
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取工作流列表"""
    workflows = db.query(Workflow).offset(skip).limit(limit).all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db)
):
    """获取工作流详情"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: int,
    workflow: WorkflowUpdate,
    db: Session = Depends(get_db)
):
    """更新工作流"""
    db_workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    for field, value in workflow.dict(exclude_unset=True).items():
        setattr(db_workflow, field, value)
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db)
):
    """删除工作流"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    db.delete(workflow)
    db.commit()
    return {"message": "Workflow deleted successfully"}


@router.post("/{workflow_id}/tasks", response_model=WorkflowTaskResponse)
async def create_workflow_task(
    workflow_id: int,
    task: WorkflowTaskCreate,
    db: Session = Depends(get_db)
):
    """创建工作流任务"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    db_task = WorkflowTask(
        workflow_id=workflow_id,
        name=task.name,
        description=task.description,
        task_type=task.task_type,
        config=task.config
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{workflow_id}/tasks", response_model=List[WorkflowTaskResponse])
async def list_workflow_tasks(
    workflow_id: int,
    db: Session = Depends(get_db)
):
    """获取工作流任务列表"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return workflow.tasks


@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: int,
    db: Session = Depends(get_db)
):
    """执行工作流"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    engine = WorkflowEngine(db)
    execution = await engine.execute_workflow(workflow)
    return execution 