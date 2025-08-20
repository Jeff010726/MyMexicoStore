// SEO配置文件
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

export const SEO_CONFIG = {
  // 默认SEO配置
  DEFAULT: {
    title: 'MyMexico Store - 墨西哥优质商品在线购物平台',
    description: '发现墨西哥最优质的商品！MyMexico Store提供家具、家电、装饰品等多种商品，支持安全支付，快速配送到您家门口。',
    keywords: '墨西哥商品,在线购物,家具,家电,装饰品,安全支付,快速配送',
    image: '/og-image.jpg',
    type: 'website' as const
  },

  // 页面特定SEO配置
  PAGES: {
    HOME: {
      title: 'MyMexico Store - 墨西哥优质商品在线购物平台',
      description: '发现墨西哥最优质的商品！MyMexico Store提供家具、家电、装饰品等多种商品，支持安全支付，快速配送到您家门口。立即开始购物，享受优质服务！',
      keywords: '墨西哥商品,在线购物,家具,家电,装饰品,安全支付,快速配送,优质服务,电商平台,爆款商品',
      type: 'website' as const
    },

    PRODUCTS: {
      title: '商品列表 - MyMexico Store',
      description: '浏览MyMexico Store的全部商品，包括家具、家电、装饰品等多种分类。支持筛选搜索，找到您心仪的商品。',
      keywords: '商品列表,家具,家电,装饰品,厨具,数码产品,商品搜索,商品筛选',
      type: 'website' as const
    },

    CART: {
      title: '购物车 - MyMexico Store',
      description: '查看您的购物车商品，确认订单信息，选择配送方式，安全便捷的结算流程。',
      keywords: '购物车,结算,订单确认,配送方式,安全支付',
      type: 'website' as const
    },

    LOGIN: {
      title: '用户登录 - MyMexico Store',
      description: '登录您的MyMexico Store账户，享受个性化购物体验，查看订单历史和会员优惠。',
      keywords: '用户登录,会员登录,账户管理,个人中心',
      type: 'website' as const
    },

    REGISTER: {
      title: '用户注册 - MyMexico Store',
      description: '注册MyMexico Store会员账户，享受专属优惠、积分奖励和优质客服服务。',
      keywords: '用户注册,会员注册,新用户优惠,积分奖励',
      type: 'website' as const
    },

    USER_CENTER: {
      title: '个人中心 - MyMexico Store',
      description: '管理您的个人信息、查看订单历史、收货地址管理、积分查询等个人账户服务。',
      keywords: '个人中心,订单查询,地址管理,积分查询,账户设置',
      type: 'website' as const
    },

    CONTACT: {
      title: '联系我们 - MyMexico Store',
      description: '联系MyMexico Store客服团队，获取购物帮助、售后服务、商务合作等相关支持。',
      keywords: '联系我们,客服支持,售后服务,商务合作,帮助中心',
      type: 'website' as const
    },

    FAQ: {
      title: '常见问题 - MyMexico Store',
      description: '查看MyMexico Store常见问题解答，包括购物流程、支付方式、配送信息、退换货政策等。',
      keywords: '常见问题,购物帮助,支付方式,配送信息,退换货政策,FAQ',
      type: 'website' as const
    },

    PRIVACY_POLICY: {
      title: '隐私政策 - MyMexico Store',
      description: 'MyMexico Store隐私政策，了解我们如何保护您的个人信息和数据安全。',
      keywords: '隐私政策,数据保护,个人信息安全,用户隐私',
      type: 'website' as const
    },

    TERMS_OF_SERVICE: {
      title: '服务条款 - MyMexico Store',
      description: 'MyMexico Store服务条款，了解平台使用规则、用户权利和义务。',
      keywords: '服务条款,使用协议,用户协议,平台规则',
      type: 'website' as const
    }
  },

  // 产品页面SEO生成器
  PRODUCT: (product: {
    name: string;
    description: string;
    price: number;
    category: string;
    brand?: string;
  }) => ({
    title: `${product.name} - ${product.category} - MyMexico Store`,
    description: `${product.description} 现价$${product.price} MXN，${product.brand ? `${product.brand}品牌，` : ''}品质保证，快速配送。立即购买享受优质服务！`,
    keywords: `${product.name},${product.category},${product.brand || ''},墨西哥购物,在线商城,${product.name}价格,${product.name}购买`,
    type: 'product' as const,
    price: product.price,
    currency: 'MXN',
    availability: 'in_stock' as const,
    brand: product.brand || 'MyMexico Store',
    category: product.category
  }),

  // 分类页面SEO生成器
  CATEGORY: (category: string, productCount: number = 0) => ({
    title: `${category}商品 - MyMexico Store`,
    description: `浏览MyMexico Store的${category}商品，${productCount > 0 ? `共${productCount}件商品，` : ''}精选优质${category}，品质保证，价格优惠。`,
    keywords: `${category},${category}商品,${category}购买,${category}价格,墨西哥${category},在线购物`,
    type: 'website' as const
  })
};

// SEO工具函数
export const SEOUtils = {
  // 生成页面标题
  generateTitle: (pageTitle: string, includeStore: boolean = true): string => {
    if (includeStore && !pageTitle.includes('MyMexico Store')) {
      return `${pageTitle} | MyMexico Store`;
    }
    return pageTitle;
  },

  // 生成描述（确保长度适中）
  generateDescription: (description: string, maxLength: number = 160): string => {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3) + '...';
  },

  // 生成关键词（确保数量适中）
  generateKeywords: (keywords: string | string[], maxKeywords: number = 10): string => {
    const keywordArray = Array.isArray(keywords) ? keywords : keywords.split(',');
    const trimmedKeywords = keywordArray
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, maxKeywords);
    return trimmedKeywords.join(',');
  },

  // 生成Open Graph图片URL
  generateOGImage: (title: string, description?: string): string => {
    // 这里可以集成动态图片生成服务
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = description ? encodeURIComponent(description.substring(0, 100)) : '';
    
    // 使用动态图片生成服务（如果有的话）
    return `${baseUrl}/api/og-image?title=${encodedTitle}&desc=${encodedDesc}`;
  },

  // 验证SEO配置
  validateSEOConfig: (config: Partial<SEOConfig>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.title || config.title.length < 10) {
      errors.push('标题长度应至少10个字符');
    }
    if (config.title && config.title.length > 60) {
      errors.push('标题长度不应超过60个字符');
    }

    if (!config.description || config.description.length < 50) {
      errors.push('描述长度应至少50个字符');
    }
    if (config.description && config.description.length > 160) {
      errors.push('描述长度不应超过160个字符');
    }

    if (!config.keywords || config.keywords.length < 10) {
      errors.push('关键词应至少包含10个字符');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default SEO_CONFIG;