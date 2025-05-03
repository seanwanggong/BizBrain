from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.models.workflow_task import WorkflowTask, TaskStatus, TaskType, task_dependencies
from app.schemas.workflow_task import (
    WorkflowTaskCreate,
    WorkflowTaskUpdate,
    WorkflowTaskResponse
)
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=WorkflowTaskResponse)
async def create_task(
    task: WorkflowTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    task_data = task.model_dump()
    db_task = WorkflowTask(**task_data)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[WorkflowTaskResponse])
async def list_tasks(
    workflow_id: Optional[UUID] = None,
    task_type: Optional[TaskType] = None,
    status: Optional[TaskStatus] = None,
    skip: int = Query(0, ge=0, description="分页起始位置"),
    limit: int = Query(100, ge=1, le=100, description="每页数量"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取工作流任务列表，支持按工作流ID、任务类型和状态筛选
    
    - **workflow_id**: 按工作流ID筛选（可选）
    - **task_type**: 按任务类型筛选（可选）
    - **status**: 按任务状态筛选（可选）
    - **skip**: 分页起始位置
    - **limit**: 每页数量
    """
    stmt = (
        select(WorkflowTask)
        .options(selectinload(WorkflowTask.dependencies))
        .offset(skip)
        .limit(limit)
    )
    
    # 应用筛选条件
    if workflow_id:
        stmt = stmt.filter(WorkflowTask.workflow_id == workflow_id)
    if task_type:
        stmt = stmt.filter(WorkflowTask.type == task_type)
    if status:
        stmt = stmt.filter(WorkflowTask.status == status)
    
    result = await db.execute(stmt)
    tasks = result.scalars().all()
    
    # 手动构建响应，包括依赖关系
    response_tasks = []
    for task in tasks:
        task_dict = WorkflowTaskResponse(
            id=task.id,
            name=task.name,
            description=task.description,
            type=task.type,
            config=task.config,
            order=task.order,
            workflow_id=task.workflow_id,
            status=task.status,
            result=task.result,
            error_message=task.error_message,
            started_at=task.started_at,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at,
            dependencies=[dep.id for dep in task.dependencies]
        )
        response_tasks.append(task_dict)
    
    return response_tasks

@router.get("/{task_id}", response_model=WorkflowTaskResponse)
async def get_task(
    task_id: UUID = Path(..., description="任务ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取特定工作流任务的详细信息
    
    - **task_id**: 任务ID
    """
    stmt = (
        select(WorkflowTask)
        .options(selectinload(WorkflowTask.dependencies))
        .where(WorkflowTask.id == task_id)
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    # 手动构建响应，包括依赖关系
    return WorkflowTaskResponse(
        id=task.id,
        name=task.name,
        description=task.description,
        type=task.type,
        config=task.config,
        order=task.order,
        workflow_id=task.workflow_id,
        status=task.status,
        result=task.result,
        error_message=task.error_message,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
        dependencies=[dep.id for dep in task.dependencies]
    )

@router.put("/{task_id}", response_model=WorkflowTaskResponse)
async def update_task(
    task_id: UUID = Path(..., description="任务ID"),
    task_update: WorkflowTaskUpdate = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    stmt = (
        select(WorkflowTask)
        .options(selectinload(WorkflowTask.dependencies))
        .where(WorkflowTask.id == task_id)
    )
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()
    if db_task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    # 更新任务字段
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    await db.commit()
    await db.refresh(db_task)
    
    # 手动构建响应，包括依赖关系
    return WorkflowTaskResponse(
        id=db_task.id,
        name=db_task.name,
        description=db_task.description,
        type=db_task.type,
        config=db_task.config,
        order=db_task.order,
        workflow_id=db_task.workflow_id,
        status=db_task.status,
        result=db_task.result,
        error_message=db_task.error_message,
        started_at=db_task.started_at,
        completed_at=db_task.completed_at,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at,
        dependencies=[dep.id for dep in db_task.dependencies]
    )

@router.delete("/{task_id}")
async def delete_task(
    task_id: UUID = Path(..., description="任务ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除工作流任务
    
    - **task_id**: 任务ID
    """
    stmt = select(WorkflowTask).where(WorkflowTask.id == task_id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()
    if db_task is None:
        raise HTTPException(
            status_code=404,
            detail=f"Task with ID {task_id} not found"
        )
    
    await db.delete(db_task)
    await db.commit()
    return {"message": f"Task {task_id} deleted successfully"}

@router.put("/{task_id}/status", response_model=WorkflowTaskResponse)
async def update_task_status(
    task_id: UUID = Path(..., description="任务ID"),
    status: TaskStatus = Query(..., description="新的任务状态"),
    error_message: Optional[str] = Query(None, description="错误信息（当状态为FAILED时）"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新任务状态
    
    - **task_id**: 任务ID
    - **status**: 新的任务状态
    - **error_message**: 错误信息（当状态为FAILED时可选）
    """
    stmt = select(WorkflowTask).where(WorkflowTask.id == task_id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()
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
        await db.commit()
        await db.refresh(db_task)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update task status: {str(e)}"
        )
    
    return db_task 