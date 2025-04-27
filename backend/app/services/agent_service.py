from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.agent import Agent
from ..schemas.agent import AgentCreate, AgentUpdate
from langchain.agents import AgentExecutor
from langchain.chat_models import ChatOpenAI
from langchain.tools import Tool
import json

class AgentService:
    def __init__(self, db: Session):
        self.db = db

    def create_agent(self, agent: AgentCreate) -> Agent:
        db_agent = Agent(
            name=agent.name,
            description=agent.description,
            type=agent.type,
            config=agent.config
        )
        self.db.add(db_agent)
        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def get_agent(self, agent_id: int) -> Optional[Agent]:
        return self.db.query(Agent).filter(Agent.id == agent_id).first()

    def get_agents(self, skip: int = 0, limit: int = 100) -> List[Agent]:
        return self.db.query(Agent).offset(skip).limit(limit).all()

    def update_agent(self, agent_id: int, agent: AgentUpdate) -> Optional[Agent]:
        db_agent = self.get_agent(agent_id)
        if not db_agent:
            return None
        
        update_data = agent.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_agent, key, value)
        
        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def delete_agent(self, agent_id: int) -> bool:
        db_agent = self.get_agent(agent_id)
        if not db_agent:
            return False
        
        self.db.delete(db_agent)
        self.db.commit()
        return True

    def create_agent_executor(self, agent: Agent) -> AgentExecutor:
        """创建LangChain Agent执行器"""
        llm = ChatOpenAI(
            temperature=0,
            model_name=agent.config.get("model_name", "gpt-3.5-turbo")
        )
        
        # 根据agent类型创建不同的工具集
        tools = self._create_tools(agent)
        
        # 创建Agent执行器
        agent_executor = AgentExecutor.from_agent_and_tools(
            agent=llm,
            tools=tools,
            verbose=True
        )
        
        return agent_executor

    def _create_tools(self, agent: Agent) -> List[Tool]:
        """根据agent配置创建工具集"""
        tools = []
        # 这里可以根据agent.type和config来创建不同的工具
        # 例如：搜索工具、计算工具、数据库查询工具等
        return tools 