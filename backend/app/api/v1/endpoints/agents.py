from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.agent_service import AgentService
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentExecutionRequest,
    AgentExecutionResponse
)
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/", response_model=AgentResponse)
def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new agent."""
    try:
        print(f"Received request data: {agent.model_dump()}")
        print(f"Current user: {current_user.id}")
        agent_service = AgentService(db)
        created_agent = agent_service.create_agent(agent, creator_id=current_user.id)
        return created_agent
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[AgentResponse])
def list_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all agents for the current user."""
    service = AgentService(db)
    return service.get_agents(skip=skip, limit=limit, creator_id=current_user.id)

@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    """Get a specific agent by ID."""
    service = AgentService(db)
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: int,
    agent_update: AgentUpdate,
    db: Session = Depends(get_db)
):
    """Update an agent."""
    service = AgentService(db)
    agent = service.update_agent(agent_id, agent_update)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found"
        )
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """Delete an agent."""
    service = AgentService(db)
    if not service.delete_agent(agent_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found"
        )
    return None

@router.post("/{agent_id}/execute", response_model=AgentExecutionResponse)
def execute_agent(
    agent_id: int,
    request: AgentExecutionRequest,
    db: Session = Depends(get_db)
):
    """Execute an agent."""
    service = AgentService(db)
    try:
        result = service.execute_agent(agent_id, request.input_text)
        return AgentExecutionResponse(
            output=result["output"],
            steps=result["steps"],
            execution_time=result["execution_time"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 