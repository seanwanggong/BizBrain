from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas.agent import AgentCreate, AgentUpdate, AgentInDB
from ..services.agent_service import AgentService
from ..core.database import get_db

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