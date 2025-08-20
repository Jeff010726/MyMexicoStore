// 网站地图生成器
interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface Product {
  id: string;
  name: string;
  updatedAt: string;
}

interface Category {
  name: string;
  slug: string;
}

export class SitemapGenerator {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'https://mymexicostore.com') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
  }

  // 生成静态页面URL
  private getStaticUrls(): SitemapUrl[] {
    const now = new Date().toISOString();
    
    return [
      {
        loc: this.baseUrl,
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/products`,
        lastmod: now,
        changefreq: 'daily',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/cart`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/login`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/register`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        loc: `${this.baseUrl}/faq`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        loc: `${this.baseUrl}/privacy-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${this.baseUrl}/terms-of-service`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];
  }

  // 生成产品页面URL
  private getProductUrls(products: Product[]): SitemapUrl[] {
    return products.map(product => ({
      loc: `${this.baseUrl}/products/${product.id}`,
      lastmod: product.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.8
    }));
  }

  // 生成分类页面URL
  private getCategoryUrls(categories: Category[]): SitemapUrl[] {
    return categories.map(category => ({
      loc: `${this.baseUrl}/products?category=${encodeURIComponent(category.slug)}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily' as const,
      priority: 0.7
    }));
  }

  // 生成XML格式的网站地图
  generateXmlSitemap(products: Product[] = [], categories: Category[] = []): string {
    const staticUrls = this.getStaticUrls();
    const productUrls = this.getProductUrls(products);
    const categoryUrls = this.getCategoryUrls(categories);
    
    const allUrls = [...staticUrls, ...productUrls, ...categoryUrls];
    
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsetClose = '</urlset>';
    
    const urlElements = allUrls.map(url => {
      let urlElement = '  <url>\n';
      urlElement += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
      
      if (url.lastmod) {
        urlElement += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      
      if (url.changefreq) {
        urlElement += `    <changefreq>${url.changefreq}</changefreq>\n`;
      }
      
      if (url.priority !== undefined) {
        urlElement += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
      }
      
      urlElement += '  </url>\n';
      return urlElement;
    }).join('');
    
    return xmlHeader + urlsetOpen + urlElements + urlsetClose;
  }

  // 生成robots.txt内容
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# 禁止访问管理后台
Disallow: /admin/
Disallow: /api/

# 禁止访问临时文件
Disallow: /tmp/
Disallow: /*.tmp$

# 允许访问重要页面
Allow: /products/
Allow: /cart
Allow: /contact
Allow: /faq

# 网站地图位置
Sitemap: ${this.baseUrl}/sitemap.xml

# 爬虫延迟（秒）
Crawl-delay: 1

# 特定搜索引擎规则
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# 社交媒体爬虫
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: WhatsApp
Allow: /
`;
  }

  // XML转义
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 生成JSON格式的网站地图（用于调试）
  generateJsonSitemap(products: Product[] = [], categories: Category[] = []): object {
    const staticUrls = this.getStaticUrls();
    const productUrls = this.getProductUrls(products);
    const categoryUrls = this.getCategoryUrls(categories);
    
    return {
      baseUrl: this.baseUrl,
      generatedAt: new Date().toISOString(),
      totalUrls: staticUrls.length + productUrls.length + categoryUrls.length,
      urls: {
        static: staticUrls,
        products: productUrls,
        categories: categoryUrls
      }
    };
  }

  // 验证URL格式

  // 获取网站地图统计信息
  getSitemapStats(products: Product[] = [], categories: Category[] = []): object {
    const staticUrls = this.getStaticUrls();
    const productUrls = this.getProductUrls(products);
    const categoryUrls = this.getCategoryUrls(categories);
    
    return {
      totalUrls: staticUrls.length + productUrls.length + categoryUrls.length,
      staticPages: staticUrls.length,
      productPages: productUrls.length,
      categoryPages: categoryUrls.length,
      lastGenerated: new Date().toISOString(),
      baseUrl: this.baseUrl
    };
  }
}

// 默认分类列表
export const defaultCategories: Category[] = [
  { name: '家具', slug: 'furniture' },
  { name: '家电', slug: 'appliances' },
  { name: '家纺', slug: 'textiles' },
  { name: '数码', slug: 'electronics' },
  { name: '厨具', slug: 'kitchenware' },
  { name: '装饰', slug: 'decoration' },
  { name: '其他', slug: 'others' }
];

// 导出默认实例
export const sitemapGenerator = new SitemapGenerator();

// 生成并保存网站地图的辅助函数
export async function generateAndSaveSitemap(products: Product[] = []): Promise<void> {
  try {
    const xmlSitemap = sitemapGenerator.generateXmlSitemap(products, defaultCategories);
    const robotsTxt = sitemapGenerator.generateRobotsTxt();
    
    // 在生产环境中，这些文件应该保存到public目录
    if (typeof window === 'undefined') {
      // Node.js环境（构建时）
      const fs = await import('fs');
      const path = await import('path');
      
      const publicDir = path.join(process.cwd(), 'public');
      
      // 确保public目录存在
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // 保存sitemap.xml
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xmlSitemap);
      
      // 保存robots.txt
      fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
      
      console.log('✅ 网站地图和robots.txt已生成');
    }
  } catch (error) {
    console.error('❌ 生成网站地图失败:', error);
  }
}

export default SitemapGenerator;