from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.deps import get_db, get_current_active_user
from ..services.workflow_service import WorkflowService
from ..schemas.workflow import (
    Workflow,
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowExecution,
    WorkflowExecutionCreate
)
from ..schemas.user import User

router = APIRouter()

@router.get("/", response_model=List[Workflow])
def get_workflows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取当前用户的所有工作流
    """
    workflow_service = WorkflowService(db)
    return workflow_service.get_workflows(skip=skip, limit=limit, user_id=current_user.id)

@router.post("/", response_model=Workflow)
def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    创建新的工作流
    """
    workflow_service = WorkflowService(db)
    return workflow_service.create_workflow(workflow, current_user.id)

@router.get("/{workflow_id}", response_model=Workflow)
def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取特定工作流的详细信息
    """
    workflow_service = WorkflowService(db)
    workflow = workflow_service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if workflow.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
def update_workflow(
    workflow_id: int,
    workflow: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    更新工作流
    """
    workflow_service = WorkflowService(db)
    db_workflow = workflow_service.get_workflow(workflow_id)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if db_workflow.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return workflow_service.update_workflow(workflow_id, workflow)

@router.delete("/{workflow_id}")
def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    删除工作流
    """
    workflow_service = WorkflowService(db)
    db_workflow = workflow_service.get_workflow(workflow_id)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if db_workflow.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    workflow_service.delete_workflow(workflow_id)
    return {"message": "Workflow deleted successfully"}

@router.post("/{workflow_id}/execute", response_model=WorkflowExecution)
async def execute_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    执行工作流
    """
    workflow_service = WorkflowService(db)
    db_workflow = workflow_service.get_workflow(workflow_id)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if db_workflow.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        execution = await workflow_service.execute_workflow(workflow_id, current_user.id)
        return execution
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}/executions", response_model=List[WorkflowExecution])
def get_workflow_executions(
    workflow_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    获取工作流的执行历史
    """
    workflow_service = WorkflowService(db)
    db_workflow = workflow_service.get_workflow(workflow_id)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    if db_workflow.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return workflow_service.get_workflow_executions(workflow_id, skip=skip, limit=limit) 