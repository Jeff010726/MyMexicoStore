import { Hono } from 'hono';
import type { Env, User } from '../types';
import { successResponse, errorResponse, validateRequired, generateId, getCurrentTimestamp } from '../utils/response';

export const usersRouter = new Hono<{ Bindings: Env }>();

// 用户注册
usersRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['email', 'name']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    // 检查邮箱是否已存在
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
    if (existing) {
      return c.json(errorResponse('Email already exists'), 400);
    }

    const user: User = {
      id: generateId(),
      email: body.email,
      name: body.name,
      phone: body.phone,
      role: 'customer',
      addresses: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, name, phone, role, addresses, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.email,
      user.name,
      user.phone,
      user.role,
      JSON.stringify(user.addresses),
      user.createdAt,
      user.updatedAt
    ).run();

    return c.json(successResponse(user, 'User registered successfully'), 201);
  } catch (error) {
    console.error('Register user error:', error);
    return c.json(errorResponse('Failed to register user'), 500);
  }
});

// 获取用户信息
usersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json(errorResponse('User not found'), 404);
    }

    return c.json(successResponse(result as User));
  } catch (error) {
    console.error('Get user error:', error);
    return c.json(errorResponse('Failed to fetch user'), 500);
  }
});

// 更新用户信息
usersRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json(errorResponse('User not found'), 404);
    }

    const updatedUser = {
      ...existing,
      ...body,
      id,
      updatedAt: getCurrentTimestamp()
    };

    await c.env.DB.prepare(`
      UPDATE users SET name = ?, phone = ?, addresses = ?, updatedAt = ? WHERE id = ?
    `).bind(
      updatedUser.name,
      updatedUser.phone,
      JSON.stringify(updatedUser.addresses),
      updatedUser.updatedAt,
      id
    ).run();

    return c.json(successResponse(updatedUser, 'User updated successfully'));
  } catch (error) {
    console.error('Update user error:', error);
    return c.json(errorResponse('Failed to update user'), 500);
  }
});