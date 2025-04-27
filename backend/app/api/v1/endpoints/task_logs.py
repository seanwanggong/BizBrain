from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.task_log import TaskLog
from app.schemas.task_log import TaskLogResponse

router = APIRouter()

@router.get("/", response_model=List[TaskLogResponse])
def list_task_logs(
    task_id: int = None,
    execution_id: int = None,
    status: str = None,
    start_time: datetime = None,
    end_time: datetime = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取任务日志列表"""
    query = db.query(TaskLog)
    
    if task_id:
        query = query.filter(TaskLog.task_id == task_id)
    if execution_id:
        query = query.filter(TaskLog.execution_id == execution_id)
    if status:
        query = query.filter(TaskLog.status == status)
    if start_time:
        query = query.filter(TaskLog.created_at >= start_time)
    if end_time:
        query = query.filter(TaskLog.created_at <= end_time)
    
    logs = query.order_by(TaskLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/{log_id}", response_model=TaskLogResponse)
def get_task_log(log_id: int, db: Session = Depends(get_db)):
    """获取特定任务日志"""
    log = db.query(TaskLog).filter(TaskLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task log with ID {log_id} not found"
        )
    return log

@router.get("/task/{task_id}", response_model=List[TaskLogResponse])
def get_task_logs_by_task(task_id: int, db: Session = Depends(get_db)):
    """获取特定任务的所有日志"""
    logs = db.query(TaskLog).filter(TaskLog.task_id == task_id).order_by(TaskLog.created_at.desc()).all()
    return logs

@router.get("/execution/{execution_id}", response_model=List[TaskLogResponse])
def get_task_logs_by_execution(execution_id: int, db: Session = Depends(get_db)):
    """获取特定执行的所有任务日志"""
    logs = db.query(TaskLog).filter(TaskLog.execution_id == execution_id).order_by(TaskLog.created_at.desc()).all()
    return logs 