from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas.agent import AgentCreate, AgentUpdate, AgentInDB, AgentExecuteRequest, AgentExecuteResponse
from ..services.agent_service import AgentService
from ..core.database import get_db
import time

router = APIRouter()

@router.post("/", response_model=AgentInDB)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.create_agent(agent)

@router.get("/", response_model=List[AgentInDB])
def list_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.get_agents(skip=skip, limit=limit)

@router.get("/{agent_id}", response_model=AgentInDB)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    service = AgentService(db)
    agent = service.get_agent(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}", response_model=AgentInDB)
def update_agent(agent_id: int, agent: AgentUpdate, db: Session = Depends(get_db)):
    service = AgentService(db)
    updated_agent = service.update_agent(agent_id, agent)
    if updated_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return updated_agent

@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    service = AgentService(db)
    success = service.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

@router.post("/{agent_id}/execute", response_model=AgentExecuteResponse)
def execute_agent(agent_id: int, request: AgentExecuteRequest, db: Session = Depends(get_db)):
    service = AgentService(db)
    try:
        result = service.execute_agent(agent_id, request.input)
        return AgentExecuteResponse(
            output=result["output"],
            steps=result["steps"],
            execution_time=result["execution_time"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 