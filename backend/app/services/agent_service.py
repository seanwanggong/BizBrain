from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models.agent import Agent
from ..schemas.agent import AgentCreate, AgentUpdate
from langchain.agents import AgentExecutor
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain.agents import create_openai_functions_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
import json
import time
from datetime import datetime
import requests
import os
import sqlite3
from openai import OpenAI
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import re
import base64
import io
import matplotlib.pyplot as plt
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from langchain.agents import Tool, AgentExecutor, LLMSingleActionAgent
from langchain.memory import ConversationBufferMemory
from langchain.prompts import StringPromptTemplate
from langchain.chains import LLMChain
from langchain_community.chat_models import ChatOpenAI
from fastapi import HTTPException, status
import concurrent.futures
import uuid
from ..models.execution_log import ExecutionLog

class AgentService:
    def __init__(self, db: Session):
        self.db = db
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def create_agent(self, agent: AgentCreate, creator_id: str) -> Agent:
        try:
            # 检查是否已存在同名agent
            existing_agent = self.db.query(Agent).filter(Agent.name == agent.name).first()
            if existing_agent:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"An agent with name '{agent.name}' already exists"
                )

            # 打印接收到的数据，用于调试
            print("=== Starting agent creation ===")
            print(f"Received agent data: {agent.model_dump()}")
            print(f"Agent type: {type(agent)}")
            
            # 准备数据
            agent_data = {
                'name': agent.name,
                'description': agent.description,
                'agent_type': agent.type,  # 使用 agent_type 而不是 type
                'config': agent.config,
                'is_active': agent.is_active,
                'creator_id': creator_id  # 添加 creator_id
            }
            print(f"Prepared agent data: {agent_data}")
            
            # 创建新的 agent 实例
            print("Creating Agent instance...")
            db_agent = Agent(**agent_data)
            print(f"Created Agent instance: {db_agent}")
            print(f"Agent instance type: {type(db_agent)}")
            print(f"Agent instance attributes: {db_agent.__dict__}")
            
            # 添加到数据库
            print("Adding agent to database...")
            self.db.add(db_agent)
            print("Committing changes...")
            self.db.commit()
            print("Refreshing agent...")
            self.db.refresh(db_agent)
            print(f"Final agent state: {db_agent.__dict__}")
            
            # 返回创建好的 agent
            print("=== Agent creation completed successfully ===")
            return db_agent
        except Exception as e:
            print("=== Error in agent creation ===")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            print(f"Error args: {e.args}")
            print(f"Agent data: {agent.model_dump()}")
            print(f"Agent type: {type(agent)}")
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create agent: {str(e)}"
            )

    def get_agent(self, agent_id: int) -> Optional[Agent]:
        agent = self.db.query(Agent).filter(Agent.id == agent_id).first()
        if agent:
            return agent
        return None

    def get_agents(self, skip: int = 0, limit: int = 100, creator_id: str = None) -> List[Agent]:
        query = self.db.query(Agent)
        if creator_id:
            query = query.filter(Agent.creator_id == creator_id)
        return query.offset(skip).limit(limit).all()

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
        # 获取Agent配置
        config = agent.config
        
        # 创建LLM实例
        llm = ChatOpenAI(
            temperature=config.get("temperature", 0),
            model_name=config.get("model", "gpt-3.5-turbo"),
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # 创建记忆组件
        memory = self._create_memory(config.get("memory", "none"))
        
        # 创建工具集
        tools = self._create_tools(agent)
        
        # 创建系统提示
        system_prompt = config.get("systemPrompt", "")
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
            MessagesPlaceholder(variable_name="chat_history")
        ])
        
        # 创建Agent
        agent = create_openai_functions_agent(llm, tools, prompt)
        
        # 创建Agent执行器
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=True,
            max_iterations=config.get("maxIterations", 3),
            early_stopping_method="force",
            handle_parsing_errors=True,
            return_intermediate_steps=True
        )
        
        return agent_executor

    def _create_memory(self, memory_type: str):
        """创建记忆组件"""
        if memory_type == "conversation":
            return ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        elif memory_type == "vectorstore":
            # 实现向量存储记忆
            pass
        return None

    def execute_agent(self, agent_id: int, input_text: str) -> Dict[str, Any]:
        """执行Agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            raise ValueError("Agent not found")
        
        if not agent.is_active:
            raise ValueError("Agent is not active")
        
        start_time = time.time()
        try:
            # 创建执行上下文
            context = self._create_execution_context(agent)
            
            # 创建Agent执行器
            agent_executor = self.create_agent_executor(agent)
            
            # 设置超时
            timeout = agent.config.get("timeout", 60)
            
            # 执行Agent
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(agent_executor.invoke, {"input": input_text})
                try:
                    result = future.result(timeout=timeout)
                except concurrent.futures.TimeoutError:
                    raise ValueError(f"Agent execution timed out after {timeout} seconds")
            
            execution_time = time.time() - start_time
            
            # 记录执行历史
            self.log_execution(
                agent_id=agent_id,
                input_text=input_text,
                output=result["output"],
                steps=result["intermediate_steps"],
                execution_time=execution_time,
                context=context
            )
            
            return {
                "output": result["output"],
                "steps": result["intermediate_steps"],
                "execution_time": execution_time,
                "context": context
            }
            
        except Exception as e:
            error_strategy = agent.config.get("errorStrategy", "fail")
            if error_strategy == "retry":
                # 实现重试逻辑
                return self._retry_execution(agent, input_text)
            elif error_strategy == "ignore":
                # 返回部分结果
                return self._handle_partial_result(e)
            else:
                raise ValueError(f"Error executing agent: {str(e)}")

    def _create_execution_context(self, agent: Agent) -> Dict[str, Any]:
        """创建执行上下文"""
        return {
            "agent_id": agent.id,
            "agent_type": agent.type,
            "timestamp": datetime.utcnow().isoformat(),
            "execution_id": str(uuid.uuid4())
        }

    def _retry_execution(self, agent: Agent, input_text: str, max_retries: int = 3) -> Dict[str, Any]:
        """重试执行"""
        last_error = None
        for attempt in range(max_retries):
            try:
                return self.execute_agent(agent.id, input_text)
            except Exception as e:
                last_error = e
                time.sleep(2 ** attempt)  # 指数退避
        raise ValueError(f"Failed after {max_retries} retries: {str(last_error)}")

    def _handle_partial_result(self, error: Exception) -> Dict[str, Any]:
        """处理部分结果"""
        return {
            "output": "Execution partially completed with errors",
            "steps": [],
            "execution_time": 0,
            "error": str(error)
        }

    def log_execution(self, agent_id: int, input_text: str, output: str, steps: List[dict], 
                     execution_time: float, context: Dict[str, Any]):
        """记录执行历史"""
        execution_log = {
            "agent_id": agent_id,
            "input": input_text,
            "output": output,
            "steps": steps,
            "execution_time": execution_time,
            "context": context,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 保存到数据库
        log = ExecutionLog(
            agent_id=agent_id,
            input=input_text,
            output=output,
            steps=steps,
            execution_time=execution_time,
            context=context
        )
        self.db.add(log)
        self.db.commit()
        
        return log

    def _create_tools(self, agent: Agent) -> List[Tool]:
        """根据agent配置创建工具集"""
        tools = []
        
        # 添加计算工具
        def calculate(expression: str) -> str:
            try:
                return str(eval(expression))
            except Exception as e:
                return f"Error: {str(e)}"
        
        tools.append(
            Tool(
                name="Calculator",
                func=calculate,
                description="Useful for when you need to answer questions about math. Input should be a mathematical expression."
            )
        )
        
        # 添加数据分析工具
        def analyze_data(data: str) -> str:
            try:
                df = pd.read_json(data)
                summary = df.describe().to_dict()
                return json.dumps(summary)
            except Exception as e:
                return f"Error analyzing data: {str(e)}"
        
        tools.append(
            Tool(
                name="AnalyzeData",
                func=analyze_data,
                description="Useful for analyzing data. Input should be a JSON string containing the data to analyze."
            )
        )

        # 添加数据可视化工具
        def visualize_data(data: str, chart_type: str = "line") -> str:
            try:
                df = pd.read_json(data)
                plt.figure(figsize=(10, 6))
                
                if chart_type == "line":
                    df.plot.line()
                elif chart_type == "bar":
                    df.plot.bar()
                elif chart_type == "scatter":
                    df.plot.scatter(x=df.columns[0], y=df.columns[1])
                elif chart_type == "hist":
                    df.hist()
                
                plt.title("Data Visualization")
                plt.tight_layout()
                
                # 将图表保存为base64编码的图片
                buf = io.BytesIO()
                plt.savefig(buf, format='png')
                buf.seek(0)
                img_str = base64.b64encode(buf.read()).decode('utf-8')
                plt.close()
                
                return f"data:image/png;base64,{img_str}"
            except Exception as e:
                return f"Error visualizing data: {str(e)}"
        
        tools.append(
            Tool(
                name="VisualizeData",
                func=visualize_data,
                description="Useful for creating data visualizations. Input should be a JSON string with 'data' and 'chart_type' (optional) keys."
            )
        )

        # 添加文本处理工具
        def process_text(text: str, operation: str) -> str:
            try:
                if operation == "tokenize":
                    return json.dumps(text.split())
                elif operation == "clean":
                    return re.sub(r'[^\w\s]', '', text)
                elif operation == "lowercase":
                    return text.lower()
                elif operation == "uppercase":
                    return text.upper()
                else:
                    return f"Unknown operation: {operation}"
            except Exception as e:
                return f"Error processing text: {str(e)}"
        
        tools.append(
            Tool(
                name="ProcessText",
                func=process_text,
                description="Useful for text processing operations. Input should be a JSON string with 'text' and 'operation' keys."
            )
        )

        # 添加网页抓取工具
        def scrape_webpage(url: str) -> str:
            try:
                response = requests.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 提取标题
                title = soup.title.string if soup.title else "No title found"
                
                # 提取正文
                paragraphs = [p.get_text() for p in soup.find_all('p')]
                content = '\n'.join(paragraphs)
                
                return json.dumps({
                    "title": title,
                    "content": content
                })
            except Exception as e:
                return f"Error scraping webpage: {str(e)}"
        
        tools.append(
            Tool(
                name="ScrapeWebpage",
                func=scrape_webpage,
                description="Useful for scraping content from webpages. Input should be a URL string."
            )
        )

        # 添加文件操作工具
        def read_file(file_path: str) -> str:
            try:
                with open(file_path, 'r') as f:
                    return f.read()
            except Exception as e:
                return f"Error reading file: {str(e)}"
        
        def write_file(file_path: str, content: str) -> str:
            try:
                with open(file_path, 'w') as f:
                    f.write(content)
                return "File written successfully"
            except Exception as e:
                return f"Error writing file: {str(e)}"
        
        tools.extend([
            Tool(
                name="ReadFile",
                func=read_file,
                description="Useful for reading the contents of a file. Input should be the file path."
            ),
            Tool(
                name="WriteFile",
                func=write_file,
                description="Useful for writing content to a file. Input should be a JSON string with 'file_path' and 'content' keys."
            )
        ])

        # 添加网络请求工具
        def make_http_request(method: str, url: str, headers: Dict[str, str] = None, body: str = None) -> str:
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    headers=headers or {},
                    data=body
                )
                return json.dumps({
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "body": response.text
                })
            except Exception as e:
                return f"Error making HTTP request: {str(e)}"
        
        tools.append(
            Tool(
                name="HTTPRequest",
                func=make_http_request,
                description="Useful for making HTTP requests. Input should be a JSON string with 'method', 'url', 'headers' (optional), and 'body' (optional) keys."
            )
        )

        # 添加数据库查询工具
        def execute_sql_query(query: str) -> str:
            try:
                # Use the existing database session
                result = self.db.execute(text(query))
                if query.strip().upper().startswith('SELECT'):
                    results = [dict(row) for row in result]
                    return json.dumps(results)
                else:
                    self.db.commit()
                    return "Query executed successfully"
            except Exception as e:
                return f"Error executing SQL query: {str(e)}"
        
        tools.append(
            Tool(
                name="SQLQuery",
                func=execute_sql_query,
                description="Useful for executing SQL queries. Input should be a valid SQL query string."
            )
        )

        # 添加时间工具
        def get_current_time() -> str:
            return datetime.now().isoformat()
        
        def format_time(timestamp: str, format_str: str) -> str:
            try:
                dt = datetime.fromisoformat(timestamp)
                return dt.strftime(format_str)
            except Exception as e:
                return f"Error formatting time: {str(e)}"
        
        tools.extend([
            Tool(
                name="GetCurrentTime",
                func=get_current_time,
                description="Useful for getting the current time."
            ),
            Tool(
                name="FormatTime",
                func=format_time,
                description="Useful for formatting timestamps. Input should be a JSON string with 'timestamp' and 'format_str' keys."
            )
        ])
        
        return tools 