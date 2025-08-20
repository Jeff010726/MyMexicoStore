import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS配置
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://jeff010726.github.io'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// 简单的密码哈希函数
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 用户注册
app.post('/users/register', async (c) => {
  try {
    const body = await c.req.json();
    
    // 基本验证
    if (!body.email || !body.name || !body.password) {
      return c.json({
        success: false,
        error: 'Missing required fields',
        message: 'Email, name and password are required'
      }, 400);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({
        success: false,
        error: 'Invalid email format'
      }, 400);
    }

    // 验证密码长度
    if (body.password.length < 6) {
      return c.json({
        success: false,
        error: 'Password must be at least 6 characters'
      }, 400);
    }

    // 检查邮箱是否已存在
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
    if (existing) {
      return c.json({
        success: false,
        error: 'Email already exists'
      }, 400);
    }

    // 哈希密码
    const hashedPassword = await hashPassword(body.password);
    const userId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, name, phone, password, role, addresses, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      body.email,
      body.name,
      body.phone || '',
      hashedPassword,
      'customer',
      JSON.stringify([]),
      timestamp,
      timestamp
    ).run();

    // 返回用户信息（不包含密码）
    return c.json({
      success: true,
      data: {
        id: userId,
        email: body.email,
        name: body.name,
        phone: body.phone || '',
        role: 'customer',
        addresses: [],
        createdAt: timestamp,
        updatedAt: timestamp
      },
      message: 'User registered successfully'
    }, 201);
  } catch (error) {
    console.error('Register user error:', error);
    return c.json({
      success: false,
      error: 'Failed to register user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// 用户登录测试
app.post('/users/login', async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.email || !body.password) {
      return c.json({
        success: false,
        error: 'Email and password are required'
      }, 400);
    }

    return c.json({
      success: true,
      message: 'Login endpoint working',
      data: { email: body.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: 'Login failed'
    }, 500);
  }
});

export default app;