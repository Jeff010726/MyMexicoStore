import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import type { Env, User } from '../types';
import { successResponse, errorResponse, validateRequired, generateId, getCurrentTimestamp } from '../utils/response';

export const usersRouter = new Hono<{ Bindings: Env }>();

// 简单的密码哈希函数
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 验证密码
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
};

// 用户注册
usersRouter.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['email', 'name', 'password']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json(errorResponse('Invalid email format'), 400);
    }

    // 验证密码长度
    if (body.password.length < 6) {
      return c.json(errorResponse('Password must be at least 6 characters'), 400);
    }

    // 检查邮箱是否已存在
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
    if (existing) {
      return c.json(errorResponse('Email already exists'), 400);
    }

    // 哈希密码
    const hashedPassword = await hashPassword(body.password);

    const user: User = {
      id: generateId(),
      email: body.email,
      name: body.name,
      phone: body.phone || '',
      role: 'customer',
      addresses: [],
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, name, phone, password, role, addresses, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.email,
      user.name,
      user.phone,
      hashedPassword,
      user.role,
      JSON.stringify(user.addresses),
      user.createdAt,
      user.updatedAt
    ).run();

    // 返回用户信息（不包含密码）
    const { ...userWithoutPassword } = user;
    return c.json(successResponse(userWithoutPassword, 'User registered successfully'), 201);
  } catch (error) {
    console.error('Register user error:', error);
    return c.json(errorResponse('Failed to register user'), 500);
  }
});

// 用户登录
usersRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['email', 'password']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    // 查找用户
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first();
    if (!user) {
      return c.json(errorResponse('Invalid email or password'), 401);
    }

    // 验证密码
    const isValidPassword = await verifyPassword(body.password, user.password as string);
    if (!isValidPassword) {
      return c.json(errorResponse('Invalid email or password'), 401);
    }

    // 生成JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    // 返回用户信息和token（不包含密码）
    const { password, ...userWithoutPassword } = user;
    
    return c.json(successResponse({
      user: userWithoutPassword,
      token
    }, 'Login successful'));
  } catch (error) {
    console.error('Login user error:', error);
    return c.json(errorResponse('Failed to login'), 500);
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

// 获取用户资料（需要认证）
usersRouter.get('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;

      const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      if (!user) {
        return c.json(errorResponse('User not found'), 404);
      }

      const { password, ...userWithoutPassword } = user;
      return c.json(successResponse(userWithoutPassword));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json(errorResponse('Failed to fetch profile'), 500);
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

// 获取用户收藏
usersRouter.get('/favorites', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;

      // 从KV存储获取用户收藏
      const favoritesKey = `favorites:${userId}`;
      const favoritesData = await c.env.USERS_KV.get(favoritesKey);
      const favoriteIds = favoritesData ? JSON.parse(favoritesData) : [];

      // 获取收藏商品详情
      const favorites = [];
      for (const productId of favoriteIds) {
        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND status = ?')
          .bind(productId, 'active').first();
        if (product) {
          favorites.push({
            id: generateId(),
            productId: product.id,
            userId,
            product: {
              ...product,
              images: JSON.parse(product.images || '[]')
            },
            createdAt: getCurrentTimestamp()
          });
        }
      }

      return c.json(successResponse({ favorites }));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json(errorResponse('Failed to fetch favorites'), 500);
  }
});

// 添加收藏
usersRouter.post('/favorites/:productId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;
      const productId = c.req.param('productId');

      // 检查商品是否存在
      const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ? AND status = ?')
        .bind(productId, 'active').first();
      if (!product) {
        return c.json(errorResponse('Product not found'), 404);
      }

      // 获取当前收藏列表
      const favoritesKey = `favorites:${userId}`;
      const favoritesData = await c.env.USERS_KV.get(favoritesKey);
      const favoriteIds = favoritesData ? JSON.parse(favoritesData) : [];

      // 检查是否已收藏
      if (favoriteIds.includes(productId)) {
        return c.json(errorResponse('Product already in favorites'), 400);
      }

      // 添加到收藏
      favoriteIds.push(productId);
      await c.env.USERS_KV.put(favoritesKey, JSON.stringify(favoriteIds));

      return c.json(successResponse({ message: 'Added to favorites' }));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Add favorite error:', error);
    return c.json(errorResponse('Failed to add favorite'), 500);
  }
});

// 移除收藏
usersRouter.delete('/favorites/:productId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;
      const productId = c.req.param('productId');

      // 获取当前收藏列表
      const favoritesKey = `favorites:${userId}`;
      const favoritesData = await c.env.USERS_KV.get(favoritesKey);
      const favoriteIds = favoritesData ? JSON.parse(favoritesData) : [];

      // 移除收藏
      const updatedFavorites = favoriteIds.filter((id: string) => id !== productId);
      await c.env.USERS_KV.put(favoritesKey, JSON.stringify(updatedFavorites));

      return c.json(successResponse({ message: 'Removed from favorites' }));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json(errorResponse('Failed to remove favorite'), 500);
  }
});

// 获取用户地址
usersRouter.get('/addresses', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;

      const user = await c.env.DB.prepare('SELECT addresses FROM users WHERE id = ?').bind(userId).first();
      if (!user) {
        return c.json(errorResponse('User not found'), 404);
      }

      const addresses = JSON.parse(user.addresses || '[]');
      return c.json(successResponse({ addresses }));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Get addresses error:', error);
    return c.json(errorResponse('Failed to fetch addresses'), 500);
  }
});

// 添加地址
usersRouter.post('/addresses', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;
      const body = await c.req.json();

      const validation = validateRequired(body, ['name', 'phone', 'address', 'city', 'state', 'zipCode']);
      if (validation) {
        return c.json(errorResponse(validation), 400);
      }

      const user = await c.env.DB.prepare('SELECT addresses FROM users WHERE id = ?').bind(userId).first();
      if (!user) {
        return c.json(errorResponse('User not found'), 404);
      }

      const addresses = JSON.parse(user.addresses || '[]');
      const newAddress = {
        id: generateId(),
        ...body,
        isDefault: addresses.length === 0 || body.isDefault,
        createdAt: getCurrentTimestamp()
      };

      // 如果设为默认地址，取消其他地址的默认状态
      if (newAddress.isDefault) {
        addresses.forEach((addr: any) => addr.isDefault = false);
      }

      addresses.push(newAddress);

      await c.env.DB.prepare('UPDATE users SET addresses = ?, updatedAt = ? WHERE id = ?')
        .bind(JSON.stringify(addresses), getCurrentTimestamp(), userId).run();

      return c.json(successResponse(newAddress, 'Address added successfully'));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Add address error:', error);
    return c.json(errorResponse('Failed to add address'), 500);
  }
});

// 更新地址
usersRouter.put('/addresses/:addressId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;
      const addressId = c.req.param('addressId');
      const body = await c.req.json();

      const user = await c.env.DB.prepare('SELECT addresses FROM users WHERE id = ?').bind(userId).first();
      if (!user) {
        return c.json(errorResponse('User not found'), 404);
      }

      const addresses = JSON.parse(user.addresses || '[]');
      const addressIndex = addresses.findIndex((addr: any) => addr.id === addressId);
      
      if (addressIndex === -1) {
        return c.json(errorResponse('Address not found'), 404);
      }

      // 如果设为默认地址，取消其他地址的默认状态
      if (body.isDefault) {
        addresses.forEach((addr: any) => addr.isDefault = false);
      }

      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...body,
        updatedAt: getCurrentTimestamp()
      };

      await c.env.DB.prepare('UPDATE users SET addresses = ?, updatedAt = ? WHERE id = ?')
        .bind(JSON.stringify(addresses), getCurrentTimestamp(), userId).run();

      return c.json(successResponse(addresses[addressIndex], 'Address updated successfully'));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Update address error:', error);
    return c.json(errorResponse('Failed to update address'), 500);
  }
});

// 删除地址
usersRouter.delete('/addresses/:addressId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization required'), 401);
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      const userId = payload.userId;
      const addressId = c.req.param('addressId');

      const user = await c.env.DB.prepare('SELECT addresses FROM users WHERE id = ?').bind(userId).first();
      if (!user) {
        return c.json(errorResponse('User not found'), 404);
      }

      const addresses = JSON.parse(user.addresses || '[]');
      const filteredAddresses = addresses.filter((addr: any) => addr.id !== addressId);
      
      if (addresses.length === filteredAddresses.length) {
        return c.json(errorResponse('Address not found'), 404);
      }

      await c.env.DB.prepare('UPDATE users SET addresses = ?, updatedAt = ? WHERE id = ?')
        .bind(JSON.stringify(filteredAddresses), getCurrentTimestamp(), userId).run();

      return c.json(successResponse({ message: 'Address deleted successfully' }));
    } catch (jwtError) {
      return c.json(errorResponse('Invalid token'), 401);
    }
  } catch (error) {
    console.error('Delete address error:', error);
    return c.json(errorResponse('Failed to delete address'), 500);
  }
});
