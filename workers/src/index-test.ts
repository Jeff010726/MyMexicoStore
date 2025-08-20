import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS配置
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://jeff010726.github.io'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 最简单的健康检查
app.get('/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'API is working'
  });
});

export default app;