#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建 secrets 目录（如果不存在）
mkdir -p secrets
chmod 700 secrets

# 生成随机密钥的函数
generate_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

# 检查并设置开发环境的 secrets
echo -e "${YELLOW}检查开发环境必要的 secrets...${NC}"

# PostgreSQL 配置
if [ ! -f secrets/postgres_user.txt ]; then
    echo -e "${YELLOW}设置开发环境 PostgreSQL 用户名...${NC}"
    echo "postgres" > secrets/postgres_user.txt
fi

if [ ! -f secrets/postgres_password.txt ]; then
    echo -e "${YELLOW}生成开发环境 PostgreSQL 密码...${NC}"
    echo "postgres" > secrets/postgres_password.txt
fi

if [ ! -f secrets/postgres_db.txt ]; then
    echo -e "${YELLOW}设置开发环境 PostgreSQL 数据库名...${NC}"
    echo "bizbrain_dev" > secrets/postgres_db.txt
fi

# 应用密钥
if [ ! -f secrets/secret_key.txt ]; then
    echo -e "${YELLOW}生成开发环境应用密钥...${NC}"
    generate_secret > secrets/secret_key.txt
fi

# OpenAI API 密钥
if [ ! -f secrets/openai_api_key.txt ]; then
    echo -e "${YELLOW}请设置开发环境 OpenAI API 密钥...${NC}"
    read -p "请输入开发环境 OpenAI API 密钥: " openai_key
    echo "$openai_key" > secrets/openai_api_key.txt
fi

# 设置文件权限
echo -e "${YELLOW}设置文件权限...${NC}"
chmod 600 secrets/*.txt

# 停止现有容器
echo -e "${YELLOW}停止现有容器...${NC}"
docker-compose -f docker-compose.dev.yml down

# 清理旧的构建缓存
echo -e "${YELLOW}清理构建缓存...${NC}"
docker builder prune -f

# 构建并启动开发环境
echo -e "${YELLOW}构建开发环境...${NC}"
docker-compose -f docker-compose.dev.yml build --no-cache

echo -e "${YELLOW}启动开发环境...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo -e "${YELLOW}等待服务启动...${NC}"
sleep 5

# 检查服务状态
echo -e "${YELLOW}检查服务状态...${NC}"
if docker-compose -f docker-compose.dev.yml ps | grep -q "running"; then
    echo -e "${GREEN}服务已成功启动！${NC}"
    echo -e "${YELLOW}应用运行在: http://localhost:8000${NC}"
    echo -e "${YELLOW}API 文档地址: http://localhost:8000/api/v1/docs${NC}"
    echo -e "${YELLOW}查看日志: docker-compose -f docker-compose.dev.yml logs -f${NC}"
else
    echo -e "${RED}服务启动失败！${NC}"
    echo -e "${YELLOW}查看错误日志: docker-compose -f docker-compose.dev.yml logs${NC}"
    exit 1
fi 