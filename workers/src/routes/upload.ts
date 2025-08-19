import { Hono } from 'hono';
import type { Env } from '../types';
import { successResponse, errorResponse, generateId } from '../utils/response';

export const uploadRouter = new Hono<{ Bindings: Env }>();

// 上传图片到R2存储
uploadRouter.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json(errorResponse('No file provided'), 400);
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json(errorResponse('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed'), 400);
    }

    // 验证文件大小（最大5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json(errorResponse('File too large. Maximum size is 5MB'), 400);
    }

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop();
    const fileName = `${generateId()}.${fileExtension}`;
    const filePath = `images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

    // 上传到R2存储
    await c.env.IMAGES.put(filePath, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // 构建访问URL
    const imageUrl = `https://your-r2-domain.com/${filePath}`;

    return c.json(successResponse({
      fileName,
      filePath,
      url: imageUrl,
      size: file.size,
      type: file.type
    }, 'Image uploaded successfully'));
  } catch (error) {
    console.error('Upload image error:', error);
    return c.json(errorResponse('Failed to upload image'), 500);
  }
});

// 批量上传图片
uploadRouter.post('/images', async (c) => {
  try {
    const formData = await c.req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return c.json(errorResponse('No files provided'), 400);
    }

    if (files.length > 10) {
      return c.json(errorResponse('Too many files. Maximum 10 files allowed'), 400);
    }

    const uploadResults = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      try {
        // 验证文件
        if (!allowedTypes.includes(file.type)) {
          uploadResults.push({
            fileName: file.name,
            success: false,
            error: 'Invalid file type'
          });
          continue;
        }

        if (file.size > maxSize) {
          uploadResults.push({
            fileName: file.name,
            success: false,
            error: 'File too large'
          });
          continue;
        }

        // 上传文件
        const fileExtension = file.name.split('.').pop();
        const fileName = `${generateId()}.${fileExtension}`;
        const filePath = `images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;

        await c.env.IMAGES.put(filePath, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });

        const imageUrl = `https://your-r2-domain.com/${filePath}`;

        uploadResults.push({
          fileName: file.name,
          success: true,
          data: {
            fileName,
            filePath,
            url: imageUrl,
            size: file.size,
            type: file.type
          }
        });
      } catch (error) {
        uploadResults.push({
          fileName: file.name,
          success: false,
          error: 'Upload failed'
        });
      }
    }

    return c.json(successResponse({
      results: uploadResults,
      total: files.length,
      successful: uploadResults.filter(r => r.success).length,
      failed: uploadResults.filter(r => !r.success).length
    }, 'Batch upload completed'));
  } catch (error) {
    console.error('Batch upload error:', error);
    return c.json(errorResponse('Failed to upload images'), 500);
  }
});

// 删除图片
uploadRouter.delete('/image/:path', async (c) => {
  try {
    const path = c.req.param('path');
    
    if (!path) {
      return c.json(errorResponse('File path is required'), 400);
    }

    // 从R2存储删除文件
    await c.env.IMAGES.delete(path);

    return c.json(successResponse(null, 'Image deleted successfully'));
  } catch (error) {
    console.error('Delete image error:', error);
    return c.json(errorResponse('Failed to delete image'), 500);
  }
});

// 获取图片信息
uploadRouter.get('/image/:path', async (c) => {
  try {
    const path = c.req.param('path');
    
    if (!path) {
      return c.json(errorResponse('File path is required'), 400);
    }

    const object = await c.env.IMAGES.head(path);
    
    if (!object) {
      return c.json(errorResponse('Image not found'), 404);
    }

    return c.json(successResponse({
      path,
      size: object.size,
      contentType: object.httpMetadata?.contentType,
      lastModified: object.uploaded,
      url: `https://your-r2-domain.com/${path}`
    }));
  } catch (error) {
    console.error('Get image info error:', error);
    return c.json(errorResponse('Failed to get image info'), 500);
  }
});