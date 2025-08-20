import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
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

// 简单的用户测试端点
app.get('/users/test', (c) => {
  return c.json({ 
    success: true, 
    message: 'Users endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// 用户注册测试
app.post('/users/register', async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      success: true,
      message: 'Registration test endpoint reached',
      data: {
        receivedData: body
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return c.json({
      success: false,
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;