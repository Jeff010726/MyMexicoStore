import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import type { Env } from './types';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { usersRouter } from './routes/users';
import { paymentRouter } from './routes/payment';
import { airwallexPaymentRouter } from './routes/airwallex-payment';
import { uploadRouter } from './routes/upload';
import { templatesRouter } from './routes/templates';

const app = new Hono<{ Bindings: Env }>();

// CORS配置
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      c.env.CORS_ORIGIN,
      'https://your-domain.github.io',
      'https://your-custom-domain.com'
    ];
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'Ecommerce API is running',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT
  });
});

// 公开API路由（无需认证）
app.route('/api/products', productsRouter);
app.route('/api/payment', paymentRouter);
app.route('/api/users', usersRouter);
app.route('/api/templates', templatesRouter);

// 需要认证的API路由
app.use('/api/admin/*', jwt({
  secret: async (c) => c.env.JWT_SECRET,
}));

app.route('/api/admin/products', productsRouter);
app.route('/api/admin/orders', ordersRouter);
app.route('/api/admin/upload', uploadRouter);

// 错误处理
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

// 404处理
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'API endpoint not found'
  }, 404);
});

export default app;