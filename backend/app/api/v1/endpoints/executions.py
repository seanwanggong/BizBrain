from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.workflow_execution import WorkflowExecution
from app.schemas.workflow_execution import (
    WorkflowExecutionCreate,
    WorkflowExecutionUpdate,
    WorkflowExecutionResponse
)
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=WorkflowExecutionResponse, status_code=status.HTTP_201_CREATED)
async def create_execution(
    execution: WorkflowExecutionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new workflow execution."""
    db_execution = WorkflowExecution(
        **execution.dict(),
        user_id=current_user.id
    )
    db.add(db_execution)
    await db.commit()
    await db.refresh(db_execution)
    return db_execution

@router.get("/", response_model=List[WorkflowExecutionResponse])
async def list_executions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all workflow executions."""
    stmt = (
        select(WorkflowExecution)
        .where(WorkflowExecution.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    executions = result.scalars().all()
    return executions

@router.get("/{execution_id}", response_model=WorkflowExecutionResponse)
async def get_execution(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific workflow execution by ID."""
    stmt = select(WorkflowExecution).where(
        WorkflowExecution.id == execution_id,
        WorkflowExecution.user_id == current_user.id
    )
    result = await db.execute(stmt)
    execution = result.scalar_one_or_none()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    return execution

@router.put("/{execution_id}", response_model=WorkflowExecutionResponse)
async def update_execution(
    execution_id: UUID,
    execution_update: WorkflowExecutionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a workflow execution."""
    stmt = select(WorkflowExecution).where(
        WorkflowExecution.id == execution_id,
        WorkflowExecution.user_id == current_user.id
    )
    result = await db.execute(stmt)
    db_execution = result.scalar_one_or_none()
    if not db_execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    
    for field, value in execution_update.dict(exclude_unset=True).items():
        setattr(db_execution, field, value)
    
    await db.commit()
    await db.refresh(db_execution)
    return db_execution

@router.delete("/{execution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_execution(
    execution_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a workflow execution."""
    stmt = select(WorkflowExecution).where(
        WorkflowExecution.id == execution_id,
        WorkflowExecution.user_id == current_user.id
    )
    result = await db.execute(stmt)
    execution = result.scalar_one_or_none()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    
    await db.delete(execution)
    await db.commit()
    return None 