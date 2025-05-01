# 开发环境设置

## 环境要求

- Python 3.11+
- Git
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 15+ (本地安装)

## 本地开发设置

### 1. 克隆代码库
```bash
git clone <repository_url>
cd backend
```

### 2. 创建虚拟环境
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或
.venv\Scripts\activate  # Windows
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 设置开发环境变量
```bash
# 创建开发环境配置文件
cp .env.example .env

# 编辑 .env 文件设置你的配置
# 配置数据库连接（根据实际情况选择一种方式）

# 方式1：连接宿主机数据库
DATABASE_URL=postgresql://morgan:test@localhost:5432/bizbrain

# 方式2：连接外部数据库
DATABASE_URL=postgresql://morgan:test@external-host:5432/bizbrain
```

### 5. 设置执行权限
```bash
# 给脚本添加执行权限
chmod +x dev.sh
chmod +x deploy.sh
```

### 6. 运行数据库迁移
```bash
alembic upgrade head
```

### 7. 启动开发服务器
```bash
# 使用开发脚本启动（需要 sudo 权限）
sudo ./dev.sh

# 或直接使用 uvicorn 启动
uvicorn app.main:app --reload
```

## Docker 开发环境

### 1. 设置开发环境 secrets
```bash
# 创建 secrets 目录
mkdir -p secrets
chmod 700 secrets

# 设置数据库配置
echo "morgan" > secrets/postgres_user.txt
echo "test" > secrets/postgres_password.txt
echo "bizbrain" > secrets/postgres_db.txt

# 设置文件权限
chmod 600 secrets/*.txt
```

### 2. 启动开发环境
```bash
sudo ./dev.sh
```

### 3. 查看日志
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

## 生产环境部署

### 1. 设置生产环境 secrets
```bash
# 创建 secrets 目录
mkdir -p secrets
chmod 700 secrets

# 设置数据库配置
echo "morgan" > secrets/postgres_user.txt
echo "test" > secrets/postgres_password.txt
echo "bizbrain" > secrets/postgres_db.txt

# 设置文件权限
chmod 600 secrets/*.txt
```

### 2. 部署生产环境
```bash
sudo ./deploy.sh
```

### 3. 查看日志
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

## 开发工具

### 代码格式化
```bash
# 安装格式化工具
pip install black isort

# 格式化代码
black .
isort .
```

### 代码检查
```bash
# 安装检查工具
pip install flake8 mypy

# 运行检查
flake8 .
mypy .
```

### 测试
```bash
# 安装测试工具
pip install pytest pytest-cov

# 运行测试
pytest
```

## 开发工作流程

1. 创建新分支
```bash
git checkout -b feature/your-feature
```

2. 开发新功能

3. 运行测试
```bash
pytest
```

4. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
```

5. 推送到远程
```bash
git push origin feature/your-feature
```

## 调试技巧

### 使用 VS Code 调试
1. 安装 Python 扩展
2. 创建 launch.json
3. 设置断点
4. 按 F5 开始调试

### 使用 pdb
```python
import pdb; pdb.set_trace()
```

### 日志调试
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 常见问题

1. 数据库连接问题
   - 确保目标数据库服务正在运行
   - 检查数据库用户名和密码是否正确
   - 验证数据库端口是否开放
   - 确认数据库名称是否正确
   - 如果连接外部数据库，确保网络连接正常
   - 检查防火墙设置是否允许连接
   - 验证 secrets 配置是否正确（特别是外部数据库连接时）

2. 依赖安装问题
   - 使用虚拟环境
   - 检查 Python 版本
   - 确保已安装 PostgreSQL 开发包

3. 测试失败
   - 检查测试环境配置
   - 查看测试日志
   - 确保测试数据库配置正确

4. 权限问题
   - 确保脚本有执行权限（chmod +x）
   - 使用 sudo 运行部署脚本
   - 检查 secrets 目录权限（700）
   - 检查 secrets 文件权限（600）

5. Docker 相关问题
   - 确保 Docker 服务正在运行
   - 检查 Docker 版本是否满足要求
   - 验证 Docker Compose 版本
   - 确保有足够的系统资源 