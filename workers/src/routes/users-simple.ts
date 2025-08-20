import { Hono } from 'hono';
import type { Env } from '../types';

export const usersRouter = new Hono<{ Bindings: Env }>();

// 简单的测试端点
usersRouter.get('/test', async (c) => {
  return c.json({ 
    success: true, 
    message: 'Users router is working',
    timestamp: new Date().toISOString()
  });
});

// 用户注册
usersRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      success: true,
      message: 'Registration endpoint reached',
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