FROM python:3.11-slim

# 先删除可能存在的其他源文件
RUN rm -rf /etc/apt/sources.list.d/*

# 创建并写入中科大源配置
RUN echo "deb http://mirrors.ustc.edu.cn/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list.d/ustc.list && \
    echo "deb http://mirrors.ustc.edu.cn/debian bookworm-updates main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/ustc.list && \
    echo "deb http://mirrors.ustc.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware" >> /etc/apt/sources.list.d/ustc.list

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/secrets && chmod 700 /run/secrets
# Copy dependency file and install Python dependencies
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -i https://mirrors.aliyun.com/pypi/simple/ --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]