# API 文档

## 认证

所有 API 请求都需要在 Header 中包含有效的 JWT token：

```
Authorization: Bearer <your_token>
```

## 接口列表

### 用户管理

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/users/me` - 获取当前用户信息

### 知识库

- `GET /api/v1/knowledge` - 获取知识库列表
- `POST /api/v1/knowledge` - 创建知识库
- `GET /api/v1/knowledge/{id}` - 获取知识库详情
- `PUT /api/v1/knowledge/{id}` - 更新知识库
- `DELETE /api/v1/knowledge/{id}` - 删除知识库

### 工作流

- `GET /api/v1/workflows` - 获取工作流列表
- `POST /api/v1/workflows` - 创建工作流
- `GET /api/v1/workflows/{id}` - 获取工作流详情
- `PUT /api/v1/workflows/{id}` - 更新工作流
- `DELETE /api/v1/workflows/{id}` - 删除工作流

## 错误码

- `400` - 请求参数错误
- `401` - 未认证
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 示例请求

### 用户登录

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "user@example.com", "password": "string"}'
```

### 获取当前用户

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
     -H "Authorization: Bearer <your_token>"
```

## API 测试

你可以使用 Swagger UI 在浏览器中测试 API：

```
http://localhost:8000/docs
``` 