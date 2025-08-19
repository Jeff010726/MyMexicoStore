import { Hono } from 'hono';
import type { Env, Product } from '../types';
import { successResponse, errorResponse, validateRequired, generateId, getCurrentTimestamp } from '../utils/response';

export const productsRouter = new Hono<{ Bindings: Env }>();

// 获取商品列表
productsRouter.get('/', async (c) => {
  try {
    const { page = '1', limit = '10', category, status = 'active' } = c.req.query();
    
    // 从KV获取商品列表
    const productsKey = `products:${status}:${category || 'all'}`;
    const cachedProducts = await c.env.PRODUCTS_KV.get(productsKey);
    
    if (cachedProducts) {
      const products = JSON.parse(cachedProducts);
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      
      return c.json(successResponse({
        products: products.slice(startIndex, endIndex),
        total: products.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }));
    }

    // 如果缓存不存在，从D1数据库查询
    const query = `
      SELECT * FROM products 
      WHERE status = ? 
      ${category ? 'AND category = ?' : ''}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const params = category 
      ? [status, category, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
      : [status, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    const products = result.results as Product[];

    // 缓存结果
    await c.env.PRODUCTS_KV.put(productsKey, JSON.stringify(products), { expirationTtl: 300 });

    return c.json(successResponse({
      products,
      total: products.length,
      page: parseInt(page),
      limit: parseInt(limit)
    }));
  } catch (error) {
    console.error('Get products error:', error);
    return c.json(errorResponse('Failed to fetch products'), 500);
  }
});

// 获取单个商品
productsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 先从KV缓存获取
    const cachedProduct = await c.env.PRODUCTS_KV.get(`product:${id}`);
    if (cachedProduct) {
      return c.json(successResponse(JSON.parse(cachedProduct)));
    }

    // 从数据库查询
    const result = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json(errorResponse('Product not found'), 404);
    }

    const product = result as Product;
    
    // 缓存商品信息
    await c.env.PRODUCTS_KV.put(`product:${id}`, JSON.stringify(product), { expirationTtl: 600 });

    return c.json(successResponse(product));
  } catch (error) {
    console.error('Get product error:', error);
    return c.json(errorResponse('Failed to fetch product'), 500);
  }
});

// 创建商品（管理员）
productsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['name', 'price', 'category']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    const product: Product = {
      id: generateId(),
      name: body.name,
      description: body.description || '',
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
      category: body.category,
      images: body.images || [],
      stock: parseInt(body.stock) || 0,
      status: body.status || 'draft',
      tags: body.tags || [],
      attributes: body.attributes || {},
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp()
    };

    // 保存到数据库
    await c.env.DB.prepare(`
      INSERT INTO products (id, name, description, price, originalPrice, category, images, stock, status, tags, attributes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product.id,
      product.name,
      product.description,
      product.price,
      product.originalPrice,
      product.category,
      JSON.stringify(product.images),
      product.stock,
      product.status,
      JSON.stringify(product.tags),
      JSON.stringify(product.attributes),
      product.createdAt,
      product.updatedAt
    ).run();

    // 清除相关缓存
    await c.env.PRODUCTS_KV.delete(`products:${product.status}:all`);
    await c.env.PRODUCTS_KV.delete(`products:${product.status}:${product.category}`);

    return c.json(successResponse(product, 'Product created successfully'), 201);
  } catch (error) {
    console.error('Create product error:', error);
    return c.json(errorResponse('Failed to create product'), 500);
  }
});

// 更新商品（管理员）
productsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // 检查商品是否存在
    const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json(errorResponse('Product not found'), 404);
    }

    const updatedProduct = {
      ...existing,
      ...body,
      id,
      updatedAt: getCurrentTimestamp()
    };

    // 更新数据库
    await c.env.DB.prepare(`
      UPDATE products SET 
        name = ?, description = ?, price = ?, originalPrice = ?, 
        category = ?, images = ?, stock = ?, status = ?, 
        tags = ?, attributes = ?, updatedAt = ?
      WHERE id = ?
    `).bind(
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.originalPrice,
      updatedProduct.category,
      JSON.stringify(updatedProduct.images),
      updatedProduct.stock,
      updatedProduct.status,
      JSON.stringify(updatedProduct.tags),
      JSON.stringify(updatedProduct.attributes),
      updatedProduct.updatedAt,
      id
    ).run();

    // 清除缓存
    await c.env.PRODUCTS_KV.delete(`product:${id}`);
    await c.env.PRODUCTS_KV.delete(`products:${updatedProduct.status}:all`);
    await c.env.PRODUCTS_KV.delete(`products:${updatedProduct.status}:${updatedProduct.category}`);

    return c.json(successResponse(updatedProduct, 'Product updated successfully'));
  } catch (error) {
    console.error('Update product error:', error);
    return c.json(errorResponse('Failed to update product'), 500);
  }
});

// 删除商品（管理员）
productsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    
    if (result.changes === 0) {
      return c.json(errorResponse('Product not found'), 404);
    }

    // 清除缓存
    await c.env.PRODUCTS_KV.delete(`product:${id}`);
    
    return c.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json(errorResponse('Failed to delete product'), 500);
  }
});