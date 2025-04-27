from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.workflow_task import WorkflowTask
from app.schemas.workflow_task import (
    WorkflowTaskCreate,
    WorkflowTaskUpdate,
    WorkflowTaskResponse
)

router = APIRouter()

@router.post("/", response_model=WorkflowTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: WorkflowTaskCreate, db: Session = Depends(get_db)):
    """Create a new workflow task."""
    db_task = WorkflowTask(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[WorkflowTaskResponse])
def list_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all workflow tasks."""
    tasks = db.query(WorkflowTask).offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=WorkflowTaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific workflow task by ID."""
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    return task

@router.put("/{task_id}", response_model=WorkflowTaskResponse)
def update_task(
    task_id: int,
    task_update: WorkflowTaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a workflow task."""
    db_task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a workflow task."""
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )
    
    db.delete(task)
    db.commit()
    return None 