# BizBrain - AI Agent协作平台

BizBrain 是一个开源的AI Agent协作平台，旨在帮助企业实现智能工作流自动化和多Agent协作。

## 主要特性

- 🤖 多Agent协作系统
- 🔄 企业级工作流自动化
- 📚 知识库管理
- 🔌 可扩展的插件系统
- 🚀 高性能和可扩展性

## 技术栈

- 后端：Python (FastAPI)
- 前端：React/Next.js
- AI：LangChain + OpenAI API
- 数据库：PostgreSQL
- 部署：Docker + Kubernetes

## 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- Docker
- PostgreSQL

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/seanwanggong/bizbrain.git
cd bizbrain
```

2. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

3. 安装前端依赖
```bash
cd frontend
npm install
```

4. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

5. 启动服务
```bash
# 启动后端
cd backend
uvicorn main:app --reload

# 启动前端
cd frontend
npm run dev
```

## 贡献指南

我们欢迎任何形式的贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解如何参与项目。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者：seanwanggong
- 邮箱：
- GitHub：https://github.com/seanwanggong