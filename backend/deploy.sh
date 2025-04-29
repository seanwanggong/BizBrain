#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以 root 用户运行
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 创建 secrets 目录（如果不存在）
mkdir -p secrets
chmod 700 secrets

# 生成随机密钥的函数
generate_secret() {
    openssl rand -base64 32 | tr -d '\n'
}

# 检查并设置 secrets
echo -e "${YELLOW}检查必要的 secrets...${NC}"

# PostgreSQL 配置
if [ ! -f secrets/postgres_user.txt ]; then
    echo -e "${YELLOW}设置 PostgreSQL 用户名...${NC}"
    echo "morgan" > secrets/postgres_user.txt
fi

if [ ! -f secrets/postgres_password.txt ]; then
    echo -e "${YELLOW}生成 PostgreSQL 密码...${NC}"
    generate_secret > secrets/postgres_password.txt
fi

if [ ! -f secrets/postgres_db.txt ]; then
    echo -e "${YELLOW}设置 PostgreSQL 数据库名...${NC}"
    echo "bizbrain" > secrets/postgres_db.txt
fi

# 应用密钥
if [ ! -f secrets/secret_key.txt ]; then
    echo -e "${YELLOW}生成应用密钥...${NC}"
    generate_secret > secrets/secret_key.txt
fi

# OpenAI API 密钥
if [ ! -f secrets/openai_api_key.txt ]; then
    echo -e "${YELLOW}请设置 OpenAI API 密钥...${NC}"
    read -p "请输入 OpenAI API 密钥: " openai_key
    echo "$openai_key" > secrets/openai_api_key.txt
fi

# 设置文件权限
echo -e "${YELLOW}设置文件权限...${NC}"
chmod 600 secrets/*.txt

# 部署服务
echo -e "${YELLOW}开始部署服务...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# 检查部署状态
echo -e "${YELLOW}检查服务状态...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}部署完成！${NC}"
echo -e "${YELLOW}请确保备份了 secrets 目录中的文件！${NC}" 