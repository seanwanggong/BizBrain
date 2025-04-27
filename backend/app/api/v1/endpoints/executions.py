from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.workflow_execution import WorkflowExecution
from app.schemas.workflow_execution import (
    WorkflowExecutionCreate,
    WorkflowExecutionUpdate,
    WorkflowExecutionResponse
)

router = APIRouter()

@router.post("/", response_model=WorkflowExecutionResponse, status_code=status.HTTP_201_CREATED)
def create_execution(execution: WorkflowExecutionCreate, db: Session = Depends(get_db)):
    """Create a new workflow execution."""
    db_execution = WorkflowExecution(**execution.dict())
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution

@router.get("/", response_model=List[WorkflowExecutionResponse])
def list_executions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all workflow executions."""
    executions = db.query(WorkflowExecution).offset(skip).limit(limit).all()
    return executions

@router.get("/{execution_id}", response_model=WorkflowExecutionResponse)
def get_execution(execution_id: int, db: Session = Depends(get_db)):
    """Get a specific workflow execution by ID."""
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    return execution

@router.put("/{execution_id}", response_model=WorkflowExecutionResponse)
def update_execution(
    execution_id: int,
    execution_update: WorkflowExecutionUpdate,
    db: Session = Depends(get_db)
):
    """Update a workflow execution."""
    db_execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if not db_execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    
    for field, value in execution_update.dict(exclude_unset=True).items():
        setattr(db_execution, field, value)
    
    db.commit()
    db.refresh(db_execution)
    return db_execution

@router.delete("/{execution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_execution(execution_id: int, db: Session = Depends(get_db)):
    """Delete a workflow execution."""
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution with ID {execution_id} not found"
        )
    
    db.delete(execution)
    db.commit()
    return None 