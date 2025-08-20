# API 接口标准化规范

## 1. RESTful API 设计原则

### 1.1 URL 设计规范

**资源命名**
- 使用名词复数形式：`/products`, `/orders`, `/users`
- 避免动词：使用HTTP方法表示操作
- 使用小写字母和连字符：`/user-addresses`

**层级关系**
```
GET /users/{id}/orders          # 获取用户的订单
GET /orders/{id}/items          # 获取订单的商品项
POST /users/{id}/addresses      # 为用户添加地址
```

**查询参数**
```
GET /products?page=1&limit=12&category=kitchen&sort=price_asc
GET /orders?status=pending&date_from=2024-01-01&date_to=2024-01-31
```

### 1.2 HTTP 方法使用规范

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 获取资源 | `GET /products` |
| POST | 创建资源 | `POST /orders` |
| PUT | 完整更新资源 | `PUT /users/{id}` |
| PATCH | 部分更新资源 | `PATCH /products/{id}` |
| DELETE | 删除资源 | `DELETE /orders/{id}` |

### 1.3 HTTP 状态码规范

**成功响应**
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `204 No Content` - 请求成功但无返回内容

**客户端错误**
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 未认证
- `403 Forbidden` - 权限不足
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突
- `422 Unprocessable Entity` - 参数验证失败

**服务器错误**
- `500 Internal Server Error` - 服务器内部错误
- `502 Bad Gateway` - 网关错误
- `503 Service Unavailable` - 服务不可用

## 2. 响应格式标准

### 2.1 统一响应结构

```json
{
  "success": true|false,
  "data": {},
  "message": "响应消息",
  "error": "错误信息（仅在success为false时存在）",
  "code": "错误代码（可选）",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2.2 成功响应示例

**单个资源**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "商品名称",
    "price": 299.99
  },
  "message": "获取成功"
}
```

**资源列表**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2.3 错误响应示例

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "请求参数验证失败",
  "code": "E001",
  "details": {
    "field": "email",
    "reason": "邮箱格式不正确"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 3. 认证和授权标准

### 3.1 JWT Token 认证

**请求头格式**
```
Authorization: Bearer <token>
```

**Token 结构**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "iat": 1640995200,
    "exp": 1641081600,
    "role": "user|admin"
  }
}
```

### 3.2 权限控制

**用户权限级别**
- `user` - 普通用户
- `admin` - 管理员
- `super_admin` - 超级管理员

### 3.3 API 访问控制

**公开接口**（无需认证）
- `GET /products` - 商品列表
- `GET /products/{id}` - 商品详情
- `POST /users/register` - 用户注册
- `POST /users/login` - 用户登录

**用户接口**（需要用户认证）
- `GET /users/profile` - 用户资料
- `POST /orders` - 创建订单
- `GET /orders/user` - 用户订单列表

**管理员接口**（需要管理员权限）
- `GET /analytics/dashboard` - 仪表板数据
- `GET /orders` - 所有订单列表
- `PUT /products/{id}` - 更新商品信息

## 4. 数据验证标准

### 4.1 输入验证规则

**用户数据**
```json
{
  "name": {
    "type": "string",
    "minLength": 2,
    "maxLength": 50,
    "pattern": "^[\\u4e00-\\u9fa5a-zA-Z\\s]+$"
  },
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 100
  },
  "password": {
    "type": "string",
    "minLength": 6,
    "maxLength": 128
  },
  "phone": {
    "type": "string",
    "pattern": "^\\+52\\s\\d{3}\\s\\d{3}\\s\\d{4}$"
  }
}
```

**商品数据**
```json
{
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 200
  },
  "price": {
    "type": "number",
    "minimum": 0.01,
    "maximum": 999999.99
  },
  "stock": {
    "type": "integer",
    "minimum": 0,
    "maximum": 99999
  }
}
```

### 4.2 错误代码标准

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E001 | 参数验证失败 | 400 |
| E002 | 用户未认证 | 401 |
| E003 | 权限不足 | 403 |
| E004 | 资源不存在 | 404 |
| E005 | 资源冲突 | 409 |
| E006 | 邮箱已存在 | 409 |
| E007 | 库存不足 | 422 |
| E008 | 支付失败 | 422 |
| E500 | 服务器内部错误 | 500 |

## 5. 分页标准

### 5.1 分页参数

```
GET /products?page=1&limit=12&sort=created_desc
```

**参数说明**
- `page` - 页码，从1开始，默认值：1
- `limit` - 每页数量，范围：1-100，默认值：12
- `sort` - 排序方式，可选值见具体接口文档

### 5.2 分页响应格式

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 120,
      "pageSize": 12,
      "hasNext": true,
      "hasPrev": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

## 6. 缓存策略

### 6.1 HTTP 缓存头

**静态资源**
```
Cache-Control: public, max-age=31536000
ETag: "abc123"
```

**动态数据**
```
Cache-Control: private, max-age=300
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

**实时数据**
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### 6.2 API 缓存策略

| 接口类型 | 缓存时间 | 缓存策略 |
|----------|----------|----------|
| 商品列表 | 5分钟 | 服务端缓存 |
| 商品详情 | 10分钟 | 服务端缓存 |
| 用户信息 | 1分钟 | 客户端缓存 |
| 订单数据 | 不缓存 | 实时获取 |
| 统计数据 | 1小时 | 服务端缓存 |

## 7. 版本管理

### 7.1 API 版本控制

**URL 版本控制**
```
https://api.example.com/v1/products
https://api.example.com/v2/products
```

**请求头版本控制**
```
Accept: application/vnd.api+json;version=1
API-Version: v1
```

### 7.2 版本兼容性

**向后兼容原则**
- 新增字段不影响现有客户端
- 废弃字段保持一定时间的兼容性
- 重大变更需要新版本号

**版本生命周期**
- 新版本发布后，旧版本保持6个月支持
- 提前3个月通知版本废弃计划
- 关键安全更新例外处理

## 8. 安全标准

### 8.1 数据传输安全

**HTTPS 强制**
- 所有API接口必须使用HTTPS
- 重定向HTTP请求到HTTPS
- 使用HSTS头部加强安全性

**请求签名**
```
Authorization: Bearer <jwt_token>
X-Timestamp: 1640995200
X-Signature: sha256=<signature>
```

### 8.2 输入安全

**SQL注入防护**
- 使用参数化查询
- 输入数据类型验证
- 特殊字符转义

**XSS防护**
- 输出数据HTML编码
- Content-Security-Policy头部
- 输入内容过滤

### 8.3 访问控制

**频率限制**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

**IP白名单**
- 管理员接口IP限制
- 支付回调IP验证
- 敏感操作地理位置验证

## 9. 监控和日志

### 9.1 API 监控指标

**性能指标**
- 响应时间（P50, P95, P99）
- 请求量（QPS）
- 错误率
- 可用性（SLA 99.9%）

**业务指标**
- 用户注册转化率
- 订单成功率
- 支付成功率
- 搜索成功率

### 9.2 日志标准

**访问日志格式**
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "method": "GET",
  "url": "/api/products",
  "status": 200,
  "responseTime": 150,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "userId": 123
}
```

**错误日志格式**
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "ERROR",
  "message": "Database connection failed",
  "error": "Connection timeout",
  "stack": "...",
  "requestId": "req-123",
  "userId": 123
}
```

## 10. 测试标准

### 10.1 API 测试类型

**单元测试**
- 业务逻辑测试
- 数据验证测试
- 错误处理测试

**集成测试**
- API接口测试
- 数据库集成测试
- 第三方服务集成测试

**性能测试**
- 负载测试
- 压力测试
- 并发测试

### 10.2 测试覆盖率要求

- 代码覆盖率 ≥ 80%
- 分支覆盖率 ≥ 70%
- 核心业务逻辑覆盖率 ≥ 95%

## 11. 文档标准

### 11.1 API 文档要求

**必需内容**
- 接口描述和用途
- 请求参数说明
- 响应格式示例
- 错误代码说明
- 使用示例

**可选内容**
- 性能指标
- 使用限制
- 最佳实践
- 常见问题

### 11.2 文档维护

**更新频率**
- 接口变更时同步更新
- 每月定期审查
- 季度全面检查

**版本控制**
- 文档版本与API版本对应
- 变更历史记录
- 向后兼容性说明

---

## 附录

### A. 常用HTTP状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 业务逻辑错误 |
| 500 | Internal Server Error | 服务器错误 |

### B. 示例代码

**JavaScript 客户端调用示例**
```javascript
// 获取商品列表
const response = await fetch('/api/products?page=1&limit=12', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  console.log('商品列表:', data.data.items);
} else {
  console.error('错误:', data.message);
}
```

**创建订单示例**
```javascript
const orderData = {
  items: [
    { productId: 1, quantity: 2, price: 299.99 }
  ],
  shippingAddress: {
    name: "张三",
    address: "Av. Insurgentes Sur 123"
  },
  paymentMethod: "credit_card"
};

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(orderData)
});
```

### C. 错误处理最佳实践

**客户端错误处理**
```javascript
try {
  const response = await apiCall();
  if (!response.success) {
    switch (response.error) {
      case 'VALIDATION_ERROR':
        showValidationErrors(response.details);
        break;
      case 'UNAUTHORIZED':
        redirectToLogin();
        break;
      default:
        showGenericError(response.message);
    }
  }
} catch (error) {
  showNetworkError();
}
```

---

*本文档版本：v1.0.0*  
*最后更新：2024-01-01*  
*维护者：开发团队*
