# 用户认证系统API文档

## 1. 接口概览

| 接口路径 | 请求方法 | 功能描述 |
| :--- | :--- | :--- |
| `/register` | POST | 用户注册 |
| `/login` | POST | 用户登录 |
| `/reset-password-request` | POST | 密码重置请求 |
| `/reset-password` | POST | 密码重置 |
| `/me` | GET | 获取当前用户信息 |

## 2. 详细接口说明

### 2.1 用户注册

**接口路径**：`/register`
**请求方法**：POST
**请求体**：
```json
{
  "username": "string",
  "password": "string",
  "phone": "string"
}
```
**参数说明**：
- `username`：用户名，长度3-50个字符，必填
- `password`：密码，长度至少6个字符，必填
- `phone`：手机号，长度10-20个字符，必填

**响应示例**：
```json
{
  "id": 1,
  "username": "testuser",
  "phone": "13800138000",
  "created_at": "2026-04-13T11:00:00",
  "last_login": null,
  "status": "enabled"
}
```

**错误响应**：
- `400 Bad Request`：用户名已存在 / 手机号已被注册

### 2.2 用户登录

**接口路径**：`/login`
**请求方法**：POST
**请求体**：
```json
{
  "username": "string",
  "password": "string"
}
```
**参数说明**：
- `username`：用户名，必填
- `password`：密码，必填

**响应示例**：
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

**错误响应**：
- `401 Unauthorized`：用户名或密码错误
- `403 Forbidden`：账户已被禁用

### 2.3 密码重置请求

**接口路径**：`/reset-password-request`
**请求方法**：POST
**请求体**：
```json
{
  "phone": "string"
}
```
**参数说明**：
- `phone`：手机号，必填

**响应示例**：
```json
{
  "message": "密码重置请求已接收，请检查手机验证码"
}
```

**错误响应**：
- `404 Not Found`：手机号未注册

### 2.4 密码重置

**接口路径**：`/reset-password`
**请求方法**：POST
**请求体**：
```json
{
  "phone": "string",
  "new_password": "string"
}
```
**参数说明**：
- `phone`：手机号，必填
- `new_password`：新密码，长度至少6个字符，必填

**响应示例**：
```json
{
  "message": "密码重置成功"
}
```

**错误响应**：
- `404 Not Found`：手机号未注册

### 2.5 获取当前用户信息

**接口路径**：`/me`
**请求方法**：GET
**请求头**：
```
Authorization: Bearer <access_token>
```

**响应示例**：
```json
{
  "id": 1,
  "username": "testuser",
  "phone": "13800138000",
  "created_at": "2026-04-13T11:00:00",
  "last_login": "2026-04-13T12:00:00",
  "status": "enabled"
}
```

**错误响应**：
- `401 Unauthorized`：无效的认证凭据
- `404 Not Found`：用户不存在
- `403 Forbidden`：账户已被禁用

## 3. 错误码说明

| 错误码 | 描述 |
| :--- | :--- |
| 400 | 请求参数错误 |
| 401 | 未授权，认证失败 |
| 403 | 禁止访问，账户被禁用 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
