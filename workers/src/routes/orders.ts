import { Hono } from 'hono';
import type { Env, Order, OrderItem } from '../types';
import { successResponse, errorResponse, validateRequired, generateId, getCurrentTimestamp } from '../utils/response';

export const ordersRouter = new Hono<{ Bindings: Env }>();

// 获取订单列表（管理员）
ordersRouter.get('/', async (c) => {
  try {
    const { page = '1', limit = '10', status, userId } = c.req.query();
    
    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (userId) {
      conditions.push('userId = ?');
      params.push(userId);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    const orders = result.results as Order[];

    return c.json(successResponse({
      orders,
      total: orders.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }));
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json(errorResponse('Failed to fetch orders'), 500);
  }
});

// 获取单个订单
ordersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json(errorResponse('Order not found'), 404);
    }

    return c.json(successResponse(result as Order));
  } catch (error) {
    console.error('Get order error:', error);
    return c.json(errorResponse('Failed to fetch order'), 500);
  }
});

// 创建订单
ordersRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['userId', 'items', 'totalAmount', 'shippingAddress']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    const order: Order = {
      id: generateId(),
      userId: body.userId,
      items: body.items,
      totalAmount: parseFloat(body.totalAmount),
      status: body.paymentId ? 'paid' : 'pending', // 如果有支付ID则标记为已支付
      paymentMethod: body.paymentMethod,
      paymentId: body.paymentId,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    // 包含paymentId字段的完整插入语句
    await c.env.DB.prepare(`
      INSERT INTO orders (id, userId, items, totalAmount, status, paymentMethod, paymentId, shippingAddress, billingAddress, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      order.id,
      order.userId,
      JSON.stringify(order.items),
      order.totalAmount,
      order.status,
      order.paymentMethod || null,
      order.paymentId || null,
      JSON.stringify(order.shippingAddress),
      JSON.stringify(order.billingAddress || order.shippingAddress),
      order.createdAt,
      order.updatedAt
    ).run();

    return c.json(successResponse(order, 'Order created successfully'), 201);
  } catch (error) {
    console.error('Create order error:', error);
    return c.json(errorResponse('Failed to create order'), 500);
  }
});

// 更新订单（兼容前端调用）
ordersRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!body.status) {
      return c.json(errorResponse('Status is required'), 400);
    }

    const result = await c.env.DB.prepare(`
      UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?
    `).bind(body.status, getCurrentTimestamp(), id).run();
    
    if (result.changes === 0) {
      return c.json(errorResponse('Order not found'), 404);
    }

    return c.json(successResponse(null, 'Order status updated successfully'));
  } catch (error) {
    console.error('Update order status error:', error);
    return c.json(errorResponse('Failed to update order status'), 500);
  }
});

// 更新订单状态（专用接口）
ordersRouter.put('/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!status) {
      return c.json(errorResponse('Status is required'), 400);
    }

    const result = await c.env.DB.prepare(`
      UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?
    `).bind(status, getCurrentTimestamp(), id).run();
    
    if (result.changes === 0) {
      return c.json(errorResponse('Order not found'), 404);
    }

    return c.json(successResponse(null, 'Order status updated successfully'));
  } catch (error) {
    console.error('Update order status error:', error);
    return c.json(errorResponse('Failed to update order status'), 500);
  }
});

// 导出订单数据
ordersRouter.get('/export', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
    const orders = result.results as Order[];

    // 生成CSV格式数据
    const csvHeaders = ['订单ID', '用户ID', '总金额', '状态', '支付方式', '创建时间', '更新时间'];
    const csvRows = orders.map(order => [
      order.id,
      order.userId,
      order.totalAmount,
      order.status,
      order.paymentMethod || '',
      order.createdAt,
      order.updatedAt
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders.csv"'
      }
    });
  } catch (error) {
    console.error('Export orders error:', error);
    return c.json(errorResponse('Failed to export orders'), 500);
  }
});
