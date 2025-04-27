#!/bin/bash

# 设置Python路径
export PYTHONPATH=$PYTHONPATH:$(pwd)

# 安装测试依赖
pip install --upgrade pip
pip install -r requirements-test.txt --no-cache-dir

# 运行测试
pytest app/tests/ -v -p asyncio

# 清理测试数据库
rm -f test.db 