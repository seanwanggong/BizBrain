from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter()

@router.get("/sections")
def get_doc_sections() -> List[Dict[str, Any]]:
    """Get all documentation sections"""
    return [
        {
            "id": "getting-started",
            "title": "快速入门",
            "content": """
# 快速入门

欢迎使用 BizBrain！本指南将帮助您快速上手我们的平台。

## 第一步：注册账号

1. 访问 BizBrain 首页
2. 点击右上角的"注册"按钮
3. 填写您的邮箱、用户名和密码
4. 点击"注册"完成账号创建

## 第二步：创建您的第一个 Agent

1. 登录后，点击左侧菜单的"Agent"
2. 点击"创建 Agent"按钮
3. 填写 Agent 的基本信息
4. 配置 Agent 的行为和能力
5. 点击"创建"完成设置

## 第三步：使用 Agent

1. 在 Agent 列表中找到您创建的 Agent
2. 点击"对话"按钮开始与 Agent 交互
3. 输入您的问题或指令
4. Agent 会根据设置响应您的请求

## 下一步

- 查看 [API 文档](/docs/api) 了解如何集成
- 浏览 [最佳实践](/docs/best-practices) 获取使用建议
- 访问 [常见问题](/docs/faq) 解答疑惑
            """
        },
        {
            "id": "api",
            "title": "API 文档",
            "content": """
# API 文档

BizBrain 提供了完整的 REST API，让您能够将我们的服务集成到您的应用中。

## 认证

所有 API 请求都需要在 Header 中包含 Bearer Token：

```
Authorization: Bearer your_token_here
```

## 基础端点

基础 URL: `http://localhost:8000/api/v1`

## Agent API

### 获取 Agent 列表

```
GET /agents

Response:
{
    "agents": [
        {
            "id": "string",
            "name": "string",
            "description": "string",
            "type": "string",
            "created_at": "string"
        }
    ]
}
```

### 创建 Agent

```
POST /agents

Request:
{
    "name": "string",
    "description": "string",
    "type": "string",
    "config": {}
}

Response:
{
    "id": "string",
    "name": "string",
    "description": "string",
    "type": "string",
    "created_at": "string"
}
```

更多 API 详情请参考我们的完整 API 文档。
            """
        },
        {
            "id": "integration",
            "title": "工具集成",
            "content": """
# 工具集成指南

BizBrain 支持与多种外部工具和服务集成，本指南将帮助您了解如何进行集成。

## 支持的集成类型

1. API 集成
2. Webhook 集成
3. 数据库集成
4. 文件系统集成
5. 第三方服务集成

## API 集成

使用我们的 REST API 进行集成：

1. 获取 API 密钥
2. 配置认证信息
3. 调用相关接口
4. 处理响应数据

## Webhook 集成

配置 Webhook 以接收实时更新：

1. 设置 Webhook URL
2. 配置事件订阅
3. 处理 Webhook 请求
4. 响应确认信息

## 更多集成方式

请参考具体的集成文档了解详细信息。
            """
        }
    ]

@router.get("/sections/{section_id}")
def get_doc_section(section_id: str) -> Dict[str, Any]:
    """Get a specific documentation section"""
    sections = {
        section["id"]: section
        for section in get_doc_sections()
    }
    if section_id not in sections:
        return {
            "id": section_id,
            "title": "页面未找到",
            "content": "抱歉，您请求的文档页面不存在。"
        }
    return sections[section_id] 