import pytest
from sqlalchemy.orm import Session
from app.models.workflow import Workflow, WorkflowExecution
from app.models.workflow_task import WorkflowTask, TaskType, TaskStatus
from app.services.workflow_engine import WorkflowEngine
from app.services.llm_service import LLMService
from datetime import datetime


@pytest.fixture
def db_session():
    # TODO: 设置测试数据库会话
    pass


@pytest.fixture
def workflow_engine(db_session):
    return WorkflowEngine(db_session)


@pytest.fixture
def llm_service():
    return LLMService()


@pytest.mark.asyncio
async def test_llm_service_completion(llm_service):
    """测试LLM服务的文本补全功能"""
    prompt = "请用一句话总结人工智能的发展趋势。"
    result = await llm_service.generate_completion(
        prompt=prompt,
        model="gpt-3.5-turbo",
        temperature=0.7,
        max_tokens=100
    )
    
    assert "choices" in result
    assert len(result["choices"]) > 0
    assert "message" in result["choices"][0]
    assert "content" in result["choices"][0]["message"]


@pytest.mark.asyncio
async def test_llm_service_sentiment(llm_service):
    """测试LLM服务的情感分析功能"""
    text = "我非常喜欢这个产品，它完全超出了我的预期！"
    result = await llm_service.analyze_sentiment(text)
    
    assert "sentiment" in result
    assert "confidence" in result
    assert "key_phrases" in result
    assert "summary" in result
    assert result["sentiment"] in ["positive", "negative", "neutral"]


@pytest.mark.asyncio
async def test_llm_service_entities(llm_service):
    """测试LLM服务的实体提取功能"""
    text = "苹果公司于2023年9月12日在加利福尼亚州发布了新款iPhone。"
    result = await llm_service.extract_entities(text)
    
    assert "entities" in result
    assert len(result["entities"]) > 0
    for entity in result["entities"]:
        assert "text" in entity
        assert "type" in entity
        assert "start" in entity
        assert "end" in entity


@pytest.mark.asyncio
async def test_llm_service_summary(llm_service):
    """测试LLM服务的文本总结功能"""
    text = """人工智能（AI）是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
    人工智能的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。人工智能从诞生以来，理论和技术日益成熟，应用领域也不断扩大。
    可以设想，未来人工智能带来的科技产品，将会是人类智慧的"容器"。
    """
    result = await llm_service.summarize_text(text, max_length=100)
    
    assert "summary" in result
    assert "key_points" in result
    assert "length" in result
    assert len(result["summary"]) <= 100


@pytest.mark.asyncio
async def test_workflow_engine_simple_workflow(workflow_engine, db_session):
    """测试简单工作流执行"""
    # 创建工作流
    workflow = Workflow(
        name="测试工作流",
        description="一个简单的测试工作流",
        is_active=True
    )
    db_session.add(workflow)
    db_session.commit()
    
    # 创建LLM任务
    llm_task = WorkflowTask(
        name="情感分析",
        description="分析文本情感",
        task_type=TaskType.LLM,
        workflow_id=workflow.id,
        config={
            "operation": "sentiment",
            "model": "gpt-3.5-turbo",
            "temperature": 0.3
        }
    )
    db_session.add(llm_task)
    db_session.commit()
    
    # 执行工作流
    input_data = {
        "text": "这个产品真是太棒了，我完全被它的功能所震撼！"
    }
    execution = await workflow_engine.execute_workflow(
        workflow_id=workflow.id,
        user_id=1,
        input_data=input_data
    )
    
    # 验证执行结果
    assert execution.status == "completed"
    assert execution.result is not None
    assert llm_task.id in execution.result
    assert "sentiment" in execution.result[llm_task.id]["result"]


@pytest.mark.asyncio
async def test_workflow_engine_complex_workflow(workflow_engine, db_session):
    """测试复杂工作流执行（包含多个任务）"""
    # 创建工作流
    workflow = Workflow(
        name="复杂测试工作流",
        description="包含多个任务的测试工作流",
        is_active=True
    )
    db_session.add(workflow)
    db_session.commit()
    
    # 创建文本总结任务
    summary_task = WorkflowTask(
        name="文本总结",
        description="总结输入文本",
        task_type=TaskType.LLM,
        workflow_id=workflow.id,
        config={
            "operation": "summary",
            "model": "gpt-3.5-turbo",
            "max_length": 100
        }
    )
    db_session.add(summary_task)
    
    # 创建情感分析任务
    sentiment_task = WorkflowTask(
        name="情感分析",
        description="分析文本情感",
        task_type=TaskType.LLM,
        workflow_id=workflow.id,
        config={
            "operation": "sentiment",
            "model": "gpt-3.5-turbo"
        }
    )
    db_session.add(sentiment_task)
    db_session.commit()
    
    # 执行工作流
    input_data = {
        "text": """人工智能正在改变我们的世界。从智能助手到自动驾驶汽车，AI技术正在各个领域展现出巨大的潜力。
        虽然AI带来了许多便利，但也引发了一些关于隐私和就业的担忧。我们需要在享受AI带来的好处的同时，
        也要认真考虑如何解决这些挑战。"""
    }
    execution = await workflow_engine.execute_workflow(
        workflow_id=workflow.id,
        user_id=1,
        input_data=input_data
    )
    
    # 验证执行结果
    assert execution.status == "completed"
    assert execution.result is not None
    assert summary_task.id in execution.result
    assert sentiment_task.id in execution.result
    assert "summary" in execution.result[summary_task.id]["result"]
    assert "sentiment" in execution.result[sentiment_task.id]["result"] 