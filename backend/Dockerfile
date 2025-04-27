FROM python:3.9-slim-bullseye

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com --no-cache-dir --timeout 1000 --retries 10 -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 使用非root用户运行
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 