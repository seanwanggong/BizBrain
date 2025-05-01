from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.models.workflow_task import WorkflowTask, TaskStatus, TaskType
from app.schemas.workflow_task import (
    WorkflowTaskCreate,
    WorkflowTaskUpdate,
    WorkflowTaskResponse
)

router = APIRouter()

@router.post("/", response_model=WorkflowTaskResponse)
def create_task(
    task: WorkflowTaskCreate,
    db: Session = Depends(get_db)
):
    """
    创建新的工作流任务
    
    - **name**: 任务名称
    - **description**: 任务描述（可选）
    - **type**: 任务类型（LLM/API/CONDITION/LOOP/PARALLEL）
    - **config**: 任务配置（可选）
    - **order**: 任务执行顺序（默认为0）
    - **workflow_id**: 所属工作流ID
    """
    db_task = WorkflowTask(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[WorkflowTaskResponse])
def list_tasks(
    workflow_id: Optional[UUID] = None,
    task_type: Optional[TaskType] = None,
    status: Optional[TaskStatus] = None,
    skip: int = Query(0, ge=0, description="分页起始位置"),
    limit: int = Query(100, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取工作流任务列表，支持按工作流ID、任务类型和状态筛选
    
    - **workflow_id**: 按工作流ID筛选（可选）
    - **task_type**: 按任务类型筛选（可选）
    - **status**: 按任务状态筛选（可选）
    - **skip**: 分页起始位置
    - **limit**: 每页数量
    """
    query = db.query(WorkflowTask)
    
    # 应用筛选条件
    if workflow_id:
        query = query.filter(WorkflowTask.workflow_id == workflow_id)
    if task_type:
        query = query.filter(WorkflowTask.type == task_type)
    if status:
        query = query.filter(WorkflowTask.status == status)
    
    # 按执行顺序和创建时间排序
    query = query.order_by(WorkflowTask.order.asc(), WorkflowTask.created_at.desc())
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=WorkflowTaskResponse)
def get_task(
    task_id: UUID = Path(..., description="任务ID"),
    db: Session = Depends(get_db)
):
    """
    获取特定工作流任务的详细信息
    
    - **task_id**: 任务ID
    """
    task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    return task

@router.put("/{task_id}", response_model=WorkflowTaskResponse)
def update_task(
    task_id: UUID = Path(..., description="任务ID"),
    task_update: WorkflowTaskUpdate = None,
    db: Session = Depends(get_db)
):
    """
    更新工作流任务
    
    - **task_id**: 任务ID
    - **name**: 任务名称（可选）
    - **description**: 任务描述（可选）
    - **type**: 任务类型（可选）
    - **config**: 任务配置（可选）
    - **order**: 任务执行顺序（可选）
    - **status**: 任务状态（可选）
    """
    db_task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    # 更新任务字段
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    try:
        db.commit()
        db.refresh(db_task)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update task: {str(e)}"
        )
    
    return db_task

@router.delete("/{task_id}")
def delete_task(
    task_id: UUID = Path(..., description="任务ID"),
    db: Session = Depends(get_db)
):
    """
    删除工作流任务
    
    - **task_id**: 任务ID
    """
    db_task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    try:
        db.delete(db_task)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete task: {str(e)}"
        )
    
    return {"message": f"Task {task_id} deleted successfully"}

@router.put("/{task_id}/status", response_model=WorkflowTaskResponse)
def update_task_status(
    task_id: UUID = Path(..., description="任务ID"),
    status: TaskStatus = Query(..., description="新的任务状态"),
    error_message: Optional[str] = Query(None, description="错误信息（当状态为FAILED时）"),
    db: Session = Depends(get_db)
):
    """
    更新任务状态
    
    - **task_id**: 任务ID
    - **status**: 新的任务状态
    - **error_message**: 错误信息（当状态为FAILED时可选）
    """
    db_task = db.query(WorkflowTask).filter(WorkflowTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    # 更新状态相关字段
    db_task.status = status
    if status == TaskStatus.RUNNING:
        db_task.started_at = datetime.utcnow()
    elif status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
        db_task.completed_at = datetime.utcnow()
        if status == TaskStatus.FAILED and error_message:
            db_task.error_message = error_message
    
    try:
        db.commit()
        db.refresh(db_task)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update task status: {str(e)}"
        )
    
    return db_task 