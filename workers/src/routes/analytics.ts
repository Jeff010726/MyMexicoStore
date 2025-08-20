import { Hono } from 'hono';
import type { Env } from '../types';
import { successResponse, errorResponse, getCurrentTimestamp } from '../utils/response';

export const analyticsRouter = new Hono<{ Bindings: Env }>();

// 获取销售数据统计
analyticsRouter.get('/sales', async (c) => {
  try {
    const { period = '7d' } = c.req.query();
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 获取订单数据
    const orders = await c.env.DB.prepare(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orderCount,
        SUM(totalAmount) as totalRevenue,
        AVG(totalAmount) as avgOrderValue,
        status
      FROM orders 
      WHERE createdAt >= ? 
      GROUP BY DATE(createdAt), status
      ORDER BY date DESC
    `).bind(startDate.toISOString()).all();

    // 处理数据
    const salesData = orders.results || [];
    
    // 计算总计
    const totalRevenue = salesData.reduce((sum: number, row: any) => 
      sum + (row.totalRevenue || 0), 0);
    const totalOrders = salesData.reduce((sum: number, row: any) => 
      sum + (row.orderCount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 按日期分组数据
    const dailyData = salesData.reduce((acc: any, row: any) => {
      const date = row.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
          pending: 0,
          paid: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        };
      }
      acc[date].revenue += row.totalRevenue || 0;
      acc[date].orders += row.orderCount || 0;
      acc[date][row.status] = row.orderCount || 0;
      return acc;
    }, {});

    const chartData = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime());

    return c.json(successResponse({
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        period
      },
      chartData
    }));
  } catch (error) {
    console.error('Get sales analytics error:', error);
    return c.json(errorResponse('Failed to fetch sales analytics'), 500);
  }
});

// 获取商品数据统计
analyticsRouter.get('/products', async (c) => {
  try {
    // 获取商品统计
    const productStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeProducts,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactiveProducts,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftProducts,
        SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) as lowStockProducts,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStockProducts
      FROM products
    `).first();

    // 获取分类统计
    const categoryStats = await c.env.DB.prepare(`
      SELECT 
        category,
        COUNT(*) as productCount,
        AVG(price) as avgPrice,
        SUM(stock) as totalStock
      FROM products 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY productCount DESC
    `).all();

    // 获取热销商品（基于订单项数据）
    const topProducts = await c.env.DB.prepare(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.category,
        p.stock,
        COUNT(o.id) as orderCount,
        SUM(JSON_EXTRACT(o.items, '$[*].quantity')) as totalSold
      FROM products p
      LEFT JOIN orders o ON JSON_EXTRACT(o.items, '$[*].productId') LIKE '%' || p.id || '%'
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY orderCount DESC, totalSold DESC
      LIMIT 10
    `).all();

    // 获取库存预警
    const stockAlerts = await c.env.DB.prepare(`
      SELECT id, name, category, stock, price
      FROM products 
      WHERE status = 'active' AND stock <= 5
      ORDER BY stock ASC
      LIMIT 20
    `).all();

    return c.json(successResponse({
      summary: productStats,
      categories: categoryStats.results || [],
      topProducts: topProducts.results || [],
      stockAlerts: stockAlerts.results || []
    }));
  } catch (error) {
    console.error('Get product analytics error:', error);
    return c.json(errorResponse('Failed to fetch product analytics'), 500);
  }
});

// 获取用户数据统计
analyticsRouter.get('/users', async (c) => {
  try {
    const { period = '30d' } = c.req.query();
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 获取用户统计
    const userStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN createdAt >= ? THEN 1 ELSE 0 END) as newUsers,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `).bind(startDate.toISOString()).first();

    // 获取用户注册趋势
    const registrationTrend = await c.env.DB.prepare(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as newUsers
      FROM users 
      WHERE createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `).bind(startDate.toISOString()).all();

    // 获取用户活跃度（基于订单）
    const userActivity = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.createdAt,
        COUNT(o.id) as orderCount,
        SUM(o.totalAmount) as totalSpent,
        MAX(o.createdAt) as lastOrderDate
      FROM users u
      LEFT JOIN orders o ON u.id = o.userId
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY totalSpent DESC
      LIMIT 20
    `).all();

    return c.json(successResponse({
      summary: userStats,
      registrationTrend: registrationTrend.results || [],
      topCustomers: userActivity.results || []
    }));
  } catch (error) {
    console.error('Get user analytics error:', error);
    return c.json(errorResponse('Failed to fetch user analytics'), 500);
  }
});

// 获取财务数据统计
analyticsRouter.get('/finance', async (c) => {
  try {
    const { period = '30d' } = c.req.query();
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 获取财务统计
    const financeStats = await c.env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN totalAmount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 'pending' THEN totalAmount ELSE 0 END) as pendingRevenue,
        SUM(CASE WHEN status = 'cancelled' THEN totalAmount ELSE 0 END) as cancelledRevenue,
        COUNT(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN 1 END) as paidOrders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
        AVG(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN totalAmount END) as avgOrderValue
      FROM orders 
      WHERE createdAt >= ?
    `).bind(startDate.toISOString()).first();

    // 获取支付方式统计
    const paymentStats = await c.env.DB.prepare(`
      SELECT 
        paymentMethod,
        COUNT(*) as orderCount,
        SUM(totalAmount) as totalAmount
      FROM orders 
      WHERE createdAt >= ? AND status IN ('paid', 'shipped', 'delivered')
      GROUP BY paymentMethod
      ORDER BY totalAmount DESC
    `).bind(startDate.toISOString()).all();

    // 获取收入趋势
    const revenueTrend = await c.env.DB.prepare(`
      SELECT 
        DATE(createdAt) as date,
        SUM(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN totalAmount ELSE 0 END) as revenue,
        COUNT(CASE WHEN status IN ('paid', 'shipped', 'delivered') THEN 1 END) as orders
      FROM orders 
      WHERE createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `).bind(startDate.toISOString()).all();

    return c.json(successResponse({
      summary: financeStats,
      paymentMethods: paymentStats.results || [],
      revenueTrend: revenueTrend.results || []
    }));
  } catch (error) {
    console.error('Get finance analytics error:', error);
    return c.json(errorResponse('Failed to fetch finance analytics'), 500);
  }
});

// 获取实时数据看板
analyticsRouter.get('/dashboard', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 今日数据
    const todayStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as todayOrders,
        SUM(totalAmount) as todayRevenue,
        AVG(totalAmount) as todayAvgOrder
      FROM orders 
      WHERE DATE(createdAt) = ?
    `).bind(today).first();

    // 昨日数据对比
    const yesterdayStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as yesterdayOrders,
        SUM(totalAmount) as yesterdayRevenue
      FROM orders 
      WHERE DATE(createdAt) = ?
    `).bind(yesterday).first();

    // 总体统计
    const overallStats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE status = 'active') as totalProducts,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as totalCustomers,
        (SELECT COUNT(*) FROM orders) as totalOrders,
        (SELECT SUM(totalAmount) FROM orders WHERE status IN ('paid', 'shipped', 'delivered')) as totalRevenue
    `).first();

    // 待处理事项
    const pendingItems = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pendingOrders,
        (SELECT COUNT(*) FROM products WHERE stock <= 5 AND status = 'active') as lowStockProducts,
        (SELECT COUNT(*) FROM products WHERE stock = 0 AND status = 'active') as outOfStockProducts
    `).first();

    // 最近订单
    const recentOrders = await c.env.DB.prepare(`
      SELECT id, userId, totalAmount, status, createdAt
      FROM orders 
      ORDER BY createdAt DESC 
      LIMIT 10
    `).all();

    return c.json(successResponse({
      today: todayStats,
      yesterday: yesterdayStats,
      overall: overallStats,
      pending: pendingItems,
      recentOrders: recentOrders.results || []
    }));
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    return c.json(errorResponse('Failed to fetch dashboard analytics'), 500);
  }
});

// 导出数据
analyticsRouter.get('/export/:type', async (c) => {
  try {
    const type = c.req.param('type');
    const { format = 'json', period = '30d' } = c.req.query();
    
    let data: any = {};
    let filename = '';

    switch (type) {
      case 'sales':
        // 导出销售数据
        const salesData = await c.env.DB.prepare(`
          SELECT 
            o.id,
            o.userId,
            o.totalAmount,
            o.status,
            o.paymentMethod,
            o.createdAt,
            u.name as customerName,
            u.email as customerEmail
          FROM orders o
          LEFT JOIN users u ON o.userId = u.id
          ORDER BY o.createdAt DESC
        `).all();
        
        data = salesData.results || [];
        filename = `sales_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'products':
        // 导出商品数据
        const productsData = await c.env.DB.prepare(`
          SELECT 
            id,
            name,
            description,
            price,
            originalPrice,
            category,
            stock,
            status,
            createdAt,
            updatedAt
          FROM products
          ORDER BY createdAt DESC
        `).all();
        
        data = productsData.results || [];
        filename = `products_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'customers':
        // 导出客户数据
        const customersData = await c.env.DB.prepare(`
          SELECT 
            u.id,
            u.name,
            u.email,
            u.phone,
            u.createdAt,
            COUNT(o.id) as orderCount,
            SUM(o.totalAmount) as totalSpent
          FROM users u
          LEFT JOIN orders o ON u.id = o.userId
          WHERE u.role = 'customer'
          GROUP BY u.id
          ORDER BY totalSpent DESC
        `).all();
        
        data = customersData.results || [];
        filename = `customers_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return c.json(errorResponse('Invalid export type'), 400);
    }

    if (format === 'csv') {
      // 转换为CSV格式
      if (data.length === 0) {
        return c.json(errorResponse('No data to export'), 400);
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) => 
          headers.map(header => 
            typeof row[header] === 'string' && row[header].includes(',') 
              ? `"${row[header]}"` 
              : row[header] || ''
          ).join(',')
        )
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      });
    }

    // 默认返回JSON格式
    return c.json(successResponse({
      data,
      exportedAt: getCurrentTimestamp(),
      recordCount: data.length
    }));

  } catch (error) {
    console.error('Export data error:', error);
    return c.json(errorResponse('Failed to export data'), 500);
  }
});