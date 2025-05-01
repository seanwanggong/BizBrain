from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict

from app.api import deps
from app.models.task import Task
from app.models.agent import Agent
from app.schemas.task import TaskStatus, TaskType

router = APIRouter()

@router.get("/stats", response_model=Dict[str, int])
async def get_dashboard_stats(
    db: AsyncSession = Depends(deps.get_db),
) -> Dict[str, int]:
    """
    获取仪表盘统计数据
    """
    try:
        # 获取任务统计
        total_tasks = await db.scalar(select(func.count()).select_from(Task))
        running_tasks = await db.scalar(
            select(func.count())
            .select_from(Task)
            .where(Task.status == TaskStatus.RUNNING)
        )
        completed_tasks = await db.scalar(
            select(func.count())
            .select_from(Task)
            .where(Task.status == TaskStatus.COMPLETED)
        )
        failed_tasks = await db.scalar(
            select(func.count())
            .select_from(Task)
            .where(Task.status == TaskStatus.FAILED)
        )
        scheduled_tasks = await db.scalar(
            select(func.count())
            .select_from(Task)
            .where(Task.type == TaskType.LOOP)
        )
        llm_tasks = await db.scalar(
            select(func.count())
            .select_from(Task)
            .where(Task.type == TaskType.LLM)
        )

        return {
            "total_tasks": total_tasks or 0,
            "running_tasks": running_tasks or 0,
            "completed_tasks": completed_tasks or 0,
            "failed_tasks": failed_tasks or 0,
            "scheduled_tasks": scheduled_tasks or 0,
            "llm_tasks": llm_tasks or 0,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取仪表盘统计数据失败: {str(e)}"
        ) 