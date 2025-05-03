from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
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
from app.core.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    *,
    db: AsyncSession = Depends(get_db),
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
        workflow_data = workflow_in.model_dump()
        db_workflow = Workflow(**workflow_data, user_id=current_user.id)
        db.add(db_workflow)
        await db.commit()
        await db.refresh(db_workflow)
        return db_workflow
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[WorkflowResponse])
async def list_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工作流列表"""
    stmt = (
        select(Workflow)
        .where(Workflow.user_id == current_user.id)
        .options(selectinload(Workflow.tasks), selectinload(Workflow.executions))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    workflows = result.scalars().all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工作流详情"""
    stmt = (
        select(Workflow)
        .where(Workflow.id == workflow_id, Workflow.user_id == current_user.id)
        .options(selectinload(Workflow.tasks), selectinload(Workflow.executions))
    )
    result = await db.execute(stmt)
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise HTTPException(status_code=404, detail="工作流不存在")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow: WorkflowUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新工作流"""
    stmt = (
        select(Workflow)
        .where(Workflow.id == workflow_id, Workflow.user_id == current_user.id)
        .options(selectinload(Workflow.tasks), selectinload(Workflow.executions))
    )
    result = await db.execute(stmt)
    db_workflow = result.scalar_one_or_none()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="工作流不存在")
    
    update_data = workflow.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_workflow, field, value)
    
    await db.commit()
    await db.refresh(db_workflow)
    return db_workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除工作流"""
    stmt = select(Workflow).where(Workflow.id == workflow_id, Workflow.user_id == current_user.id)
    result = await db.execute(stmt)
    db_workflow = result.scalar_one_or_none()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="工作流不存在")
    
    await db.delete(db_workflow)
    await db.commit()
    return {"message": "工作流已删除"}


@router.post("/{workflow_id}/tasks", response_model=WorkflowTaskResponse)
async def create_workflow_task(
    workflow_id: UUID,
    task: WorkflowTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create workflow task."""
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    )
    result = await db.execute(stmt)
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    task_data = task.model_dump()
    db_task = WorkflowTask(
        workflow_id=workflow_id,
        **task_data
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task


@router.get("/{workflow_id}/tasks", response_model=List[WorkflowTaskResponse])
async def list_workflow_tasks(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工作流任务列表"""
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    )
    result = await db.execute(stmt)
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return workflow.tasks


@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute workflow."""
    stmt = select(Workflow).where(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    )
    result = await db.execute(stmt)
    workflow = result.scalar_one_or_none()
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