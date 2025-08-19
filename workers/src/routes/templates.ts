import { Hono } from 'hono';
import type { Env } from '../types';

const templatesRouter = new Hono<{ Bindings: Env }>();

// 获取所有模板
templatesRouter.get('/', async (c) => {
  try {
    const stmt = c.env.DB.prepare(`
      SELECT * FROM templates 
      ORDER BY is_default DESC, updated_at DESC
    `);
    
    const { results } = await stmt.all();
    
    const templates = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      thumbnail: row.thumbnail,
      components: JSON.parse(row.components || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isDefault: Boolean(row.is_default),
      usageCount: row.usage_count || 0
    }));
    
    return c.json({ success: true, templates });
  } catch (error) {
    console.error('获取模板失败:', error);
    return c.json({ success: false, error: '获取模板失败' }, 500);
  }
});

// 获取单个模板
templatesRouter.get('/:id', async (c) => {
  try {
    const templateId = c.req.param('id');
    const stmt = c.env.DB.prepare('SELECT * FROM templates WHERE id = ?');
    const template = await stmt.first(templateId);
    
    if (!template) {
      return c.json({ success: false, error: '模板不存在' }, 404);
    }
    
    const templateData = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      thumbnail: template.thumbnail,
      components: JSON.parse(template.components || '[]'),
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      isDefault: Boolean(template.is_default),
      usageCount: template.usage_count || 0
    };
    
    return c.json({ success: true, template: templateData });
  } catch (error) {
    console.error('获取模板失败:', error);
    return c.json({ success: false, error: '获取模板失败' }, 500);
  }
});

// 创建模板
templatesRouter.post('/', async (c) => {
  try {
    const data = await c.req.json();
    const { name, description, category, thumbnail, components } = data;
    
    if (!name || !category) {
      return c.json({ success: false, error: '模板名称和分类不能为空' }, 400);
    }
    
    const templateId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const stmt = c.env.DB.prepare(`
      INSERT INTO templates (
        id, name, description, category, thumbnail, components, 
        created_at, updated_at, is_default, usage_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      templateId,
      name,
      description || '',
      category,
      thumbnail || '/placeholder.svg?height=200&width=300',
      JSON.stringify(components || []),
      now,
      now,
      0, // is_default
      0  // usage_count
    ).run();
    
    const template = {
      id: templateId,
      name,
      description: description || '',
      category,
      thumbnail: thumbnail || '/placeholder.svg?height=200&width=300',
      components: components || [],
      createdAt: now,
      updatedAt: now,
      isDefault: false,
      usageCount: 0
    };
    
    return c.json({ success: true, template }, 201);
  } catch (error) {
    console.error('创建模板失败:', error);
    return c.json({ success: false, error: '创建模板失败' }, 500);
  }
});

// 更新模板
templatesRouter.put('/:id', async (c) => {
  try {
    const templateId = c.req.param('id');
    const data = await c.req.json();
    const { name, description, category, thumbnail, components } = data;
    
    if (!name || !category) {
      return c.json({ success: false, error: '模板名称和分类不能为空' }, 400);
    }
    
    const now = new Date().toISOString();
    
    const stmt = c.env.DB.prepare(`
      UPDATE templates 
      SET name = ?, description = ?, category = ?, thumbnail = ?, 
          components = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const result = await stmt.bind(
      name,
      description || '',
      category,
      thumbnail || '/placeholder.svg?height=200&width=300',
      JSON.stringify(components || []),
      now,
      templateId
    ).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, error: '模板不存在' }, 404);
    }
    
    const template = {
      id: templateId,
      name,
      description: description || '',
      category,
      thumbnail: thumbnail || '/placeholder.svg?height=200&width=300',
      components: components || [],
      createdAt: data.createdAt || now,
      updatedAt: now,
      isDefault: data.isDefault || false,
      usageCount: data.usageCount || 0
    };
    
    return c.json({ success: true, template });
  } catch (error) {
    console.error('更新模板失败:', error);
    return c.json({ success: false, error: '更新模板失败' }, 500);
  }
});

// 删除模板
templatesRouter.delete('/:id', async (c) => {
  try {
    const templateId = c.req.param('id');
    
    // 检查是否为默认模板
    const checkStmt = c.env.DB.prepare('SELECT is_default FROM templates WHERE id = ?');
    const template = await checkStmt.first(templateId);
    
    if (!template) {
      return c.json({ success: false, error: '模板不存在' }, 404);
    }
    
    if (template.is_default) {
      return c.json({ success: false, error: '不能删除默认模板' }, 400);
    }
    
    const stmt = c.env.DB.prepare('DELETE FROM templates WHERE id = ?');
    const result = await stmt.bind(templateId).run();
    
    if (result.changes === 0) {
      return c.json({ success: false, error: '模板不存在' }, 404);
    }
    
    return c.json({ success: true, message: '模板删除成功' });
  } catch (error) {
    console.error('删除模板失败:', error);
    return c.json({ success: false, error: '删除模板失败' }, 500);
  }
});

export { templatesRouter };