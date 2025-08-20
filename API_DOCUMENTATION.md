# 墨西哥电商独立站 API 文档

## 概述

本文档描述了墨西哥电商独立站的完整API接口规范，基于RESTful架构设计，使用JSON格式进行数据交换。

### 基本信息

- **API版本**: v1.0
- **基础URL**: `https://ecommerce-api.jeff010726bd.workers.dev`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证方式

API使用JWT (JSON Web Token) 进行身份认证。需要认证的接口需要在请求头中包含：

```
Authorization: Bearer <token>
```

### 响应格式

所有API响应都遵循统一的格式：

```json
{
  "success": true|false,
  "data": {},
  "message": "响应消息",
  "error": "错误信息（仅在success为false时存在）"
}
```

### HTTP状态码

- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 1. 用户管理 API

### 1.1 用户注册

**接口地址**: `POST /users/register`

**请求参数**:
```json
{
  "name": "用户姓名",
  "email": "用户邮箱",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "注册成功"
}
```

### 1.2 用户登录

**接口地址**: `POST /users/login`

**请求参数**:
```json
{
  "email": "用户邮箱",
  "password": "密码"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  },
  "message": "登录成功"
}
```

### 1.3 获取用户资料

**接口地址**: `GET /users/profile`

**认证**: 需要

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "+52 123 456 7890",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 1.4 更新用户资料

**接口地址**: `PUT /users/profile`

**认证**: 需要

**请求参数**:
```json
{
  "name": "新姓名",
  "phone": "新电话"
}
```

### 1.5 获取用户收藏

**接口地址**: `GET /users/favorites`

**认证**: 需要

**响应示例**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "name": "多功能厨房收纳盒",
        "price": 299.99,
        "image": "https://example.com/image.jpg",
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 1.6 添加/移除收藏

**接口地址**: `POST /users/favorites`

**认证**: 需要

**请求参数**:
```json
{
  "productId": 1,
  "action": "add|remove"
}
```

### 1.7 获取用户地址

**接口地址**: `GET /users/addresses`

**认证**: 需要

**响应示例**:
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": 1,
        "name": "张三",
        "phone": "+52 123 456 7890",
        "address": "Av. Insurgentes Sur 123",
        "city": "Mexico City",
        "state": "CDMX",
        "zipCode": "01000",
        "country": "Mexico",
        "isDefault": true
      }
    ]
  }
}
```

### 1.8 添加地址

**接口地址**: `POST /users/addresses`

**认证**: 需要

**请求参数**:
```json
{
  "name": "收货人姓名",
  "phone": "电话号码",
  "address": "详细地址",
  "city": "城市",
  "state": "州/省",
  "zipCode": "邮编",
  "country": "国家",
  "isDefault": false
}
```

---

## 2. 商品管理 API

### 2.1 获取商品列表

**接口地址**: `GET /products`

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 12)
- `category`: 分类筛选
- `search`: 搜索关键词
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sortBy`: 排序方式 (price_asc, price_desc, name_asc, name_desc, created_desc)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "多功能厨房收纳盒",
        "description": "高品质塑料材质，多格设计",
        "price": 299.99,
        "originalPrice": 399.99,
        "category": "kitchen",
        "stock": 50,
        "images": ["https://example.com/image1.jpg"],
        "rating": 4.5,
        "reviewCount": 128,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 120,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2.2 获取商品详情

**接口地址**: `GET /products/{id}`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "多功能厨房收纳盒",
    "description": "高品质塑料材质，多格设计，适合各种厨房用品收纳",
    "price": 299.99,
    "originalPrice": 399.99,
    "category": "kitchen",
    "stock": 50,
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "specifications": {
      "材质": "高品质塑料",
      "尺寸": "30x20x15cm",
      "重量": "500g"
    },
    "rating": 4.5,
    "reviewCount": 128,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2.3 搜索建议

**接口地址**: `GET /products/search-suggestions`

**查询参数**:
- `q`: 搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "厨房收纳盒",
      "厨房用品",
      "收纳整理"
    ]
  }
}
```

### 2.4 创建商品 (管理员)

**接口地址**: `POST /admin/products`

**认证**: 需要管理员权限

**请求参数**:
```json
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 299.99,
  "originalPrice": 399.99,
  "category": "kitchen",
  "stock": 100,
  "images": ["图片URL数组"],
  "specifications": {
    "材质": "塑料",
    "尺寸": "30x20x15cm"
  }
}
```

### 2.5 更新商品 (管理员)

**接口地址**: `PUT /admin/products/{id}`

**认证**: 需要管理员权限

### 2.6 删除商品 (管理员)

**接口地址**: `DELETE /admin/products/{id}`

**认证**: 需要管理员权限

---

## 3. 订单管理 API

### 3.1 创建订单

**接口地址**: `POST /orders`

**认证**: 需要

**请求参数**:
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 299.99
    }
  ],
  "shippingAddress": {
    "name": "张三",
    "phone": "+52 123 456 7890",
    "address": "Av. Insurgentes Sur 123",
    "city": "Mexico City",
    "state": "CDMX",
    "zipCode": "01000",
    "country": "Mexico"
  },
  "paymentMethod": "credit_card"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "ORD-20240101-001",
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "productName": "多功能厨房收纳盒",
        "quantity": 2,
        "price": 299.99,
        "subtotal": 599.98
      }
    ],
    "subtotal": 599.98,
    "shippingFee": 50.00,
    "totalAmount": 649.98,
    "status": "pending",
    "shippingAddress": {
      "name": "张三",
      "phone": "+52 123 456 7890",
      "address": "Av. Insurgentes Sur 123, Mexico City, CDMX 01000, Mexico"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 获取用户订单列表

**接口地址**: `GET /orders/user`

**认证**: 需要

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `status`: 订单状态筛选

**响应示例**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ORD-20240101-001",
        "totalAmount": 649.98,
        "status": "shipped",
        "itemCount": 2,
        "createdAt": "2024-01-01T00:00:00Z",
        "items": [
          {
            "productName": "多功能厨房收纳盒",
            "quantity": 2,
            "price": 299.99
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48
    }
  }
}
```

### 3.3 获取订单详情

**接口地址**: `GET /orders/{id}`

**认证**: 需要

### 3.4 取消订单

**接口地址**: `PUT /orders/{id}/cancel`

**认证**: 需要

### 3.5 获取所有订单 (管理员)

**接口地址**: `GET /admin/orders`

**认证**: 需要管理员权限

### 3.6 更新订单状态 (管理员)

**接口地址**: `PUT /admin/orders/{id}/status`

**认证**: 需要管理员权限

**请求参数**:
```json
{
  "status": "paid|shipped|delivered|cancelled"
}
```

---

## 4. 支付管理 API

### 4.1 创建支付意图

**接口地址**: `POST /airwallex/create-payment-intent`

**认证**: 需要

**请求参数**:
```json
{
  "orderId": "ORD-20240101-001",
  "amount": 649.98,
  "currency": "USD"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "int_hkdmr7v9rg1j58ky8re",
    "clientSecret": "int_hkdmr7v9rg1j58ky8re_secret_...",
    "amount": 649.98,
    "currency": "USD",
    "status": "requires_payment_method"
  }
}
```

### 4.2 确认支付

**接口地址**: `POST /airwallex/confirm-payment`

**认证**: 需要

**请求参数**:
```json
{
  "paymentIntentId": "int_hkdmr7v9rg1j58ky8re",
  "paymentMethod": {
    "type": "card",
    "card": {
      "number": "4111111111111111",
      "expiry_month": "12",
      "expiry_year": "2025",
      "cvc": "123"
    }
  }
}
```

---

## 5. 数据统计 API

### 5.1 获取仪表板数据

**接口地址**: `GET /analytics/dashboard`

**认证**: 需要管理员权限

**响应示例**:
```json
{
  "success": true,
  "data": {
    "today": {
      "todayOrders": 15,
      "todayRevenue": 4500.00,
      "todayAvgOrder": 300.00
    },
    "yesterday": {
      "yesterdayOrders": 12,
      "yesterdayRevenue": 3600.00
    },
    "overall": {
      "totalProducts": 150,
      "totalCustomers": 1250,
      "totalOrders": 3500,
      "totalRevenue": 125000.00
    },
    "pending": {
      "pendingOrders": 8,
      "lowStockProducts": 5,
      "outOfStockProducts": 2
    },
    "recentOrders": [
      {
        "id": "ORD-20240101-001",
        "userId": 1,
        "totalAmount": 649.98,
        "status": "paid",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 5.2 获取销售数据

**接口地址**: `GET /analytics/sales`

**认证**: 需要管理员权限

**查询参数**:
- `period`: 时间周期 (1d, 7d, 30d, 90d)

### 5.3 获取商品分析

**接口地址**: `GET /analytics/products`

**认证**: 需要管理员权限

### 5.4 获取用户统计

**接口地址**: `GET /analytics/users`

**认证**: 需要管理员权限

### 5.5 导出数据

**接口地址**: `GET /analytics/export/{type}`

**认证**: 需要管理员权限

**查询参数**:
- `format`: 导出格式 (csv, xlsx)
- `type`: 数据类型 (sales, products, customers)

---

## 6. 文件上传 API

### 6.1 上传图片

**接口地址**: `POST /admin/upload`

**认证**: 需要管理员权限

**请求格式**: multipart/form-data

**请求参数**:
- `file`: 图片文件 (支持 jpg, png, webp)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg",
    "size": 1024000
  }
}
```

---

## 7. 错误处理

### 7.1 错误响应格式

```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息",
  "code": "ERROR_CODE"
}
```

### 7.2 常见错误码

- `VALIDATION_ERROR` - 参数验证失败
- `AUTHENTICATION_ERROR` - 认证失败
- `AUTHORIZATION_ERROR` - 权限不足
- `RESOURCE_NOT_FOUND` - 资源不存在
- `DUPLICATE_RESOURCE` - 资源重复
- `INSUFFICIENT_STOCK` - 库存不足
- `PAYMENT_FAILED` - 支付失败
- `INTERNAL_ERROR` - 服务器内部错误

---

## 8. 接口测试

### 8.1 测试环境

- **测试URL**: `https://ecommerce-api.jeff010726bd.workers.dev`
- **测试账号**: test@example.com / 123456

### 8.2 测试工具推荐

- Postman
- Insomnia
- curl
- HTTPie

### 8.3 测试用例示例

```bash
# 用户注册
curl -X POST https://ecommerce-api.jeff010726bd.workers.dev/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@example.com","password":"123456"}'

# 用户登录
curl -X POST https://ecommerce-api.jeff010726bd.workers.dev/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 获取商品列表
curl -X GET "https://ecommerce-api.jeff010726bd.workers.dev/products?page=1&limit=12"

# 创建订单 (需要token)
curl -X POST https://ecommerce-api.jeff010726bd.workers.dev/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"productId":1,"quantity":2,"price":299.99}],"shippingAddress":{"name":"张三","phone":"+52 123 456 7890","address":"Av. Insurgentes Sur 123","city":"Mexico City","state":"CDMX","zipCode":"01000","country":"Mexico"},"paymentMethod":"credit_card"}'
```

---

## 9. 版本更新日志

### v1.0 (2024-01-01)
- 初始版本发布
- 实现用户管理、商品管理、订单管理基础功能
- 集成Airwallex支付系统
- 添加数据统计分析功能

---

## 10. 联系方式

如有API相关问题，请联系：
- 邮箱: info@aimorelogy.com
- 技术支持: 24小时在线服务

---

*最后更新时间: 2024-01-01*