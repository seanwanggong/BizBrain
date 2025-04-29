# BizBrain - AI Agent协作平台

BizBrain 是一个开源的AI Agent协作平台，旨在帮助企业实现智能工作流自动化和多Agent协作。

## 主要特性

- 🤖 多Agent协作系统
  - Agent创建和管理
  - Agent角色定制
  - Agent间通信协议
  - Agent执行历史记录
- 🔄 企业级工作流自动化
  - 可视化工作流设计器
  - 工作流模板库
  - 任务调度和监控
  - 错误处理和重试机制
- 📚 知识库管理
  - 文档导入和索引
  - 向量数据库集成
  - 知识图谱构建
  - 智能问答系统
- 🔌 可扩展的插件系统
  - 自定义工具集成
  - API连接器
  - 数据源适配器
  - 第三方服务集成
- 🚀 高性能和可扩展性
  - 分布式任务处理
  - 实时数据同步
  - 性能监控和优化
  - 水平扩展支持
- 🌐 多语言支持
  - 支持中文和英文
  - 默认显示英文
  - 可随时切换语言
  - 记住用户语言偏好

## 功能路线图

### Phase 1 - 基础设施建设 (当前阶段)
- [x] 项目基础架构搭建
- [x] Docker容器化部署
- [x] 用户认证和授权系统
- [x] 基础API开发
- [x] 数据库模型设计

### Phase 2 - Agent系统核心功能
- [ ] Agent创建和配置界面
- [ ] Agent执行引擎
- [ ] 基础工具集成
  - [ ] 文本处理
  - [ ] 数据分析
  - [ ] 网络请求
  - [ ] 文件操作
- [ ] Agent执行日志和监控

### Phase 3 - 知识库和工作流
- [ ] 文档管理系统
- [ ] 向量数据库集成
- [ ] 基础工作流设计器
- [ ] 工作流执行引擎
- [ ] 任务调度系统

### Phase 4 - 协作和集成
- [ ] Agent间通信机制
- [ ] 团队协作功能
- [ ] API集成框架
- [ ] 插件市场
- [ ] 第三方服务连接器

### Phase 5 - 高级功能和优化
- [ ] 高级工作流编排
- [ ] 知识图谱构建
- [ ] 性能优化和监控
- [ ] 多租户支持
- [ ] 企业级功能扩展

## 技术栈

- 后端：Python (FastAPI)
- 前端：React/Next.js
- AI：LangChain + OpenAI API
- 数据库：PostgreSQL
- 部署：Docker + Kubernetes

## 快速开始

### 环境要求
- Node.js 16+
- Python 3.9+
- Docker & docker-compose
- PostgreSQL 14+

### 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/seanwanggong/bizbrain.git
cd bizbrain
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. 环境变量配置
```bash
# 后端环境变量
cp backend/.env.example backend/.env

# 前端环境变量
cp frontend/.env.example frontend/.env
```

5. 启动开发服务器

后端：
```bash
cd backend
uvicorn app.main:app --reload
```

前端：
```bash
cd frontend
npm run dev
```

### Docker部署

使用docker-compose启动所有服务：

```bash
docker-compose up -d
docker-compose down && docker-compose up -d
```

访问：
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 文档

- [产品需求文档](./PRD.md)
- [API文档](http://localhost:8000/docs)
- [开发文档](./docs/development.md)

## 贡献指南

我们欢迎任何形式的贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解如何参与项目。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 项目维护者：seanwanggong
- 邮箱：
- GitHub：https://github.com/seanwanggong