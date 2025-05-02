from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow
from app.models.workflow_task import WorkflowTask, TaskType, TaskStatus
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowExecutionResponse
)
from app.schemas.workflow_task import (
    WorkflowTaskCreate,
    WorkflowTaskUpdate,
    WorkflowTaskResponse
)
from app.services.workflow_engine import WorkflowEngine
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_in: WorkflowCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new workflow.
    """
    try:
        print(f"Current user: {current_user}")
        print(f"Current user id: {current_user.id if current_user else None}")
        print(f"Workflow data: {workflow_in.model_dump()}")
        workflow = Workflow()
        workflow.name = workflow_in.name
        workflow.description = workflow_in.description
        if isinstance(workflow_in.config, dict):
            workflow.config = dict(workflow_in.config)
        else:
            workflow.config = {"nodes": [], "edges": []}
        workflow.user_id = current_user.id
        
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve workflows.
    """
    workflows = db.query(Workflow).filter(Workflow.user_id == current_user.id).offset(skip).limit(limit).all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: UUID,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get workflow by ID.
    """
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: UUID,
    workflow_in: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update workflow.
    """
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    for field, value in workflow_in.model_dump(exclude_unset=True).items():
        setattr(workflow, field, value)
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """
    Delete workflow.
    """
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )
    db.delete(workflow)
    db.commit()


@router.post("/{workflow_id}/tasks", response_model=WorkflowTaskResponse)
async def create_workflow_task(
    workflow_id: UUID,
    task: WorkflowTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create workflow task."""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
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
def list_workflow_tasks(
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
    workflow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute workflow."""
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    engine = WorkflowEngine(db)
    try:
        execution = await engine.execute_workflow(workflow_id, current_user.id)
        return execution
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )