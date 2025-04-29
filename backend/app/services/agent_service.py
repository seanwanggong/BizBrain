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
from langchain.chat_models import ChatOpenAI

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
            model_name=agent.config.get("model_name", "gpt-3.5-turbo"),
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # 根据agent类型创建不同的工具集
        tools = self._create_tools(agent)
        
        # 创建系统提示
        system_message = """You are a helpful AI assistant that can use various tools to help users accomplish tasks. 
        You have access to the following tools:
        - Calculator: For mathematical calculations
        - ReadFile: For reading file contents
        - WriteFile: For writing to files
        - HTTPRequest: For making HTTP requests
        - SQLQuery: For executing SQL queries
        - GetCurrentTime: For getting the current time
        - FormatTime: For formatting timestamps
        
        Use these tools appropriately to help users with their requests.
        Always respond with a complete sentence, even when using tools."""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        # 创建Agent
        agent = create_openai_functions_agent(llm, tools, prompt)
        
        # 创建Agent执行器
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            return_intermediate_steps=True,
            handle_parsing_errors=True
        )
        
        return agent_executor

    def execute_agent(self, agent_id: int, input_text: str) -> Dict[str, Any]:
        """执行Agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            raise ValueError("Agent not found")
        
        if not agent.is_active:
            raise ValueError("Agent is not active")
        
        start_time = time.time()
        try:
            agent_executor = self.create_agent_executor(agent)
            result = agent_executor.invoke({"input": input_text})
            execution_time = time.time() - start_time
            
            # 记录执行历史
            self.log_execution(
                agent_id=agent_id,
                input_text=input_text,
                output=result["output"],
                steps=result["intermediate_steps"],
                execution_time=execution_time
            )
            
            return {
                "output": result["output"],
                "steps": result["intermediate_steps"],
                "execution_time": execution_time
            }
        except Exception as e:
            raise ValueError(f"Error executing agent: {str(e)}")

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

    def log_execution(self, agent_id: int, input_text: str, output: str, steps: List[dict], execution_time: float):
        """记录agent执行历史"""
        execution_log = {
            "agent_id": agent_id,
            "input": input_text,
            "output": output,
            "steps": steps,
            "execution_time": execution_time,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 这里可以将日志保存到数据库或文件系统中
        # 目前先打印到控制台
        print(f"Execution Log: {json.dumps(execution_log, indent=2)}") 