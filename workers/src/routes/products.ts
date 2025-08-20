import { Hono } from 'hono';
import type { Env, Product } from '../types';
import { successResponse, errorResponse, validateRequired, generateId, getCurrentTimestamp } from '../utils/response';
import { cacheMiddleware, CacheConfigs } from '../utils/cache';

const products = new Hono<{ Bindings: Env }>();

// 获取商品列表（支持高级搜索和筛选）- 带缓存优化
products.get('/', async (c) => {
  return cacheMiddleware(
    c.req.raw,
    async () => {
      try {
        const { 
          page = '1', 
          limit = '20', 
          category, 
          status = 'active',
          search,
          minPrice,
          maxPrice,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          inStock
        } = c.req.query();
        
        // 构建查询条件
        let query = 'SELECT * FROM products WHERE status = ?';
        const params: any[] = [status];
        const conditions: string[] = [];
        
        // 分类筛选
        if (category && category !== 'all') {
          conditions.push('category = ?');
          params.push(category);
        }
        
        // 搜索功能（商品名称、描述、标签）
        if (search) {
          conditions.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)');
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // 价格范围筛选
        if (minPrice) {
          conditions.push('price >= ?');
          params.push(parseFloat(minPrice));
        }
        
        if (maxPrice) {
          conditions.push('price <= ?');
          params.push(parseFloat(maxPrice));
        }
        
        // 库存筛选
        if (inStock === 'true') {
          conditions.push('stock > 0');
        }
        
        // 添加条件到查询
        if (conditions.length > 0) {
          query += ' AND ' + conditions.join(' AND ');
        }
        
        // 排序
        const validSortFields = ['createdAt', 'price', 'name', 'stock'];
        const validSortOrders = ['asc', 'desc'];
        
        if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
          query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        } else {
          query += ' ORDER BY createdAt DESC';
        }
        
        // 分页
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        // 执行查询
        const result = await c.env.DB.prepare(query).bind(...params).all();
        const products = result.results as Product[];
        
        // 获取总数（用于分页）
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE status = ?';
        const countParams: any[] = [status];
        
        if (conditions.length > 0) {
          countQuery += ' AND ' + conditions.join(' AND ');
          countParams.push(...params.slice(1, -2)); // 排除limit和offset参数
        }
        
        const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first();
        const total = (countResult as any)?.total || 0;

        // 处理商品数据格式
        const formattedProducts = products.map(product => ({
          ...product,
          images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
          tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
          attributes: typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes
        }));

        return new Response(JSON.stringify(successResponse({
          products: formattedProducts,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        })), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Get products error:', error);
        return new Response(JSON.stringify(errorResponse('Failed to fetch products')), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    },
    CacheConfigs.PRODUCTS_LIST
  );
});

// 商品搜索建议（自动完成）- 带缓存优化
products.get('/search/suggestions', async (c) => {
  return cacheMiddleware(
    c.req.raw,
    async () => {
      try {
        const { q } = c.req.query();
        
        if (!q || q.length < 2) {
          return new Response(JSON.stringify(successResponse({ suggestions: [] })), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        const query = `
          SELECT DISTINCT name FROM products 
          WHERE status = 'active' AND name LIKE ? 
          LIMIT 10
        `;
        
        const result = await c.env.DB.prepare(query).bind(`%${q}%`).all();
        const suggestions = result.results.map((row: any) => row.name);
        
        return new Response(JSON.stringify(successResponse({ suggestions })), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Search suggestions error:', error);
        return new Response(JSON.stringify(errorResponse('Failed to get search suggestions')), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    },
    { ...CacheConfigs.API_RESPONSE, key: `search_suggestions_${c.req.query('q')}` }
  );
});

// 获取商品分类和统计信息 - 带缓存优化
products.get('/categories', async (c) => {
  return cacheMiddleware(
    c.req.raw,
    async () => {
      try {
        const query = `
          SELECT 
            category,
            COUNT(*) as count,
            MIN(price) as minPrice,
            MAX(price) as maxPrice,
            AVG(price) as avgPrice
          FROM products 
          WHERE status = 'active' 
          GROUP BY category
          ORDER BY count DESC
        `;
        
        const result = await c.env.DB.prepare(query).all();
        const categories = result.results;
        
        return new Response(JSON.stringify(successResponse({ categories })), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Get categories error:', error);
        return new Response(JSON.stringify(errorResponse('Failed to get categories')), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    },
    { ...CacheConfigs.STATIC_ASSETS, key: 'categories_list' }
  );
});

// 获取单个商品 - 带缓存优化
products.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  return cacheMiddleware(
    c.req.raw,
    async () => {
      try {
        // 先从KV缓存获取
        const cachedProduct = await c.env.PRODUCTS_KV?.get(`product:${id}`);
        if (cachedProduct) {
          return new Response(JSON.stringify(successResponse(JSON.parse(cachedProduct))), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 从数据库查询
        const result = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
        
        if (!result) {
          return new Response(JSON.stringify(errorResponse('Product not found')), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const product = result as Product;
        
        // 缓存商品信息到KV（如果可用）
        if (c.env.PRODUCTS_KV) {
          await c.env.PRODUCTS_KV.put(`product:${id}`, JSON.stringify(product), { expirationTtl: 600 });
        }

        return new Response(JSON.stringify(successResponse(product)), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Get product error:', error);
        return new Response(JSON.stringify(errorResponse('Failed to fetch product')), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    },
    CacheConfigs.PRODUCT_DETAIL
  );
});

// 创建商品（管理员）
products.post('/', async (c) => {
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
    if (c.env.PRODUCTS_KV) {
      await c.env.PRODUCTS_KV.delete(`products:${product.status}:all`);
      await c.env.PRODUCTS_KV.delete(`products:${product.status}:${product.category}`);
    }

    return c.json(successResponse(product, 'Product created successfully'), 201);
  } catch (error) {
    console.error('Create product error:', error);
    return c.json(errorResponse('Failed to create product'), 500);
  }
});

// 更新商品（管理员）
products.put('/:id', async (c) => {
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
    if (c.env.PRODUCTS_KV) {
      await c.env.PRODUCTS_KV.delete(`product:${id}`);
      await c.env.PRODUCTS_KV.delete(`products:${updatedProduct.status}:all`);
      await c.env.PRODUCTS_KV.delete(`products:${updatedProduct.status}:${updatedProduct.category}`);
    }

    return c.json(successResponse(updatedProduct, 'Product updated successfully'));
  } catch (error) {
    console.error('Update product error:', error);
    return c.json(errorResponse('Failed to update product'), 500);
  }
});

// 批量更新商品状态（上架/下架）
products.patch('/batch-status', async (c) => {
  try {
    const body = await c.req.json();
    const { productIds, status } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return c.json(errorResponse('Product IDs are required'), 400);
    }

    if (!['active', 'inactive', 'draft'].includes(status)) {
      return c.json(errorResponse('Invalid status'), 400);
    }

    const placeholders = productIds.map(() => '?').join(',');
    const query = `UPDATE products SET status = ?, updatedAt = ? WHERE id IN (${placeholders})`;
    const params = [status, getCurrentTimestamp(), ...productIds];

    const result = await c.env.DB.prepare(query).bind(...params).run();

    // 清除相关缓存
    if (c.env.PRODUCTS_KV) {
      for (const id of productIds) {
        await c.env.PRODUCTS_KV.delete(`product:${id}`);
      }
      await c.env.PRODUCTS_KV.delete(`products:active:all`);
      await c.env.PRODUCTS_KV.delete(`products:inactive:all`);
      await c.env.PRODUCTS_KV.delete(`products:draft:all`);
    }

    return c.json(successResponse({
      updated: result.changes,
      status
    }, `Successfully updated ${result.changes} products to ${status}`));
  } catch (error) {
    console.error('Batch update status error:', error);
    return c.json(errorResponse('Failed to update product status'), 500);
  }
});

// 删除商品（管理员）
products.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    
    if (result.changes === 0) {
      return c.json(errorResponse('Product not found'), 404);
    }

    // 清除缓存
    if (c.env.PRODUCTS_KV) {
      await c.env.PRODUCTS_KV.delete(`product:${id}`);
    }
    
    return c.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    console.error('Delete product error:', error);
    return c.json(errorResponse('Failed to delete product'), 500);
  }
});

export { products as productsRouter };