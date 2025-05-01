# 部署指南

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 内存
- 至少 10GB 磁盘空间

## 部署步骤

1. 克隆代码库
```bash
git clone <repository_url>
cd backend
```

2. 设置 secrets
```bash
mkdir -p secrets
chmod 700 secrets

# 设置数据库配置
echo "your_username" > secrets/postgres_user.txt
echo "your_password" > secrets/postgres_password.txt
echo "your_database" > secrets/postgres_db.txt

# 设置应用密钥
openssl rand -base64 32 | tr -d '\n' > secrets/secret_key.txt

# 设置 OpenAI API 密钥
echo "your_openai_key" > secrets/openai_api_key.txt

# 设置文件权限
chmod 600 secrets/*.txt
```

3. 构建和启动服务
```bash
docker-compose up -d
```

4. 检查服务状态
```bash
docker-compose ps
```

## 环境变量配置

所有配置都通过 Docker secrets 管理，包括：

- 数据库配置
- 应用密钥
- API 密钥

## 备份和恢复

### 数据库备份
```bash
# 创建备份
docker-compose exec db pg_dump -U postgres bizbrain > backup.sql

# 恢复备份
docker-compose exec -T db psql -U postgres bizbrain < backup.sql
```

### Secrets 备份
```bash
# 备份 secrets 目录
tar -czf secrets_backup.tar.gz secrets/
```

## 监控和维护

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f db
```

### 服务维护
```bash
# 重启服务
docker-compose restart

# 更新服务
docker-compose pull
docker-compose up -d
```

## 故障排除

常见问题及解决方案：

1. 数据库连接失败
   - 检查数据库服务是否运行
   - 验证数据库配置是否正确

2. 应用无法启动
   - 检查日志输出
   - 验证 secrets 配置

3. 性能问题
   - 检查系统资源使用情况
   - 优化数据库查询
   - 调整容器资源限制

## 安全建议

1. 定期更新密码和密钥
2. 限制数据库访问
3. 启用防火墙
4. 定期备份数据
5. 监控系统日志 