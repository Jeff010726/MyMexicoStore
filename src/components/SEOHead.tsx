import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'MyMexico Store - 墨西哥优质商品在线购物平台',
  description = '发现墨西哥最优质的商品！MyMexico Store提供家具、家电、装饰品等多种商品，支持安全支付，快速配送到您家门口。',
  keywords = '墨西哥商品,在线购物,家具,家电,装饰品,安全支付,快速配送',
  image = '/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  price,
  currency = 'MXN',
  availability = 'in_stock',
  brand = 'MyMexico Store',
  category
}) => {
  const siteTitle = 'MyMexico Store';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  
  // 结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: title,
    description,
    url,
    image,
    ...(type === 'product' && price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability === 'in_stock' ? 'InStock' : 'OutOfStock'}`,
        seller: {
          '@type': 'Organization',
          name: brand
        }
      },
      brand: {
        '@type': 'Brand',
        name: brand
      },
      ...(category && {
        category: {
          '@type': 'Thing',
          name: category
        }
      })
    }),
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/products?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  };

  // 组织信息结构化数据
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyMexico Store',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png`,
    description: '墨西哥优质商品在线购物平台',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-555-0123',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English']
    },
    sameAs: [
      'https://facebook.com/mymexicostore',
      'https://instagram.com/mymexicostore',
      'https://twitter.com/mymexicostore'
    ]
  };

  // 更新页面标题和元数据
  useEffect(() => {
    // 更新页面标题
    document.title = fullTitle;
    
    // 更新或创建meta标签的辅助函数
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // 基础元数据
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'MyMexico Store');
    updateMetaTag('robots', 'index, follow');
    
    // 语言和地区
    updateMetaTag('language', 'es-MX');
    updateMetaTag('geo.region', 'MX');
    updateMetaTag('geo.country', 'Mexico');
    
    // Open Graph
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:site_name', 'MyMexico Store', true);
    updateMetaTag('og:locale', 'es_MX', true);
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // 产品特定标签
    if (type === 'product' && price) {
      updateMetaTag('product:price:amount', price.toString(), true);
      updateMetaTag('product:price:currency', currency, true);
      updateMetaTag('product:availability', availability, true);
      if (brand) updateMetaTag('product:brand', brand, true);
      if (category) updateMetaTag('product:category', category, true);
    }

    // 更新规范链接
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // 添加结构化数据
    const addStructuredData = (data: object, id: string) => {
      let script = document.querySelector(`script[data-seo-id="${id}"]`);
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo-id', id);
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    addStructuredData(structuredData, 'main-structured-data');
    addStructuredData(organizationData, 'organization-data');

    // 面包屑导航结构化数据
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: window.location.origin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title,
            item: window.location.href
          }
        ]
      };
      addStructuredData(breadcrumbData, 'breadcrumb-data');
    }

  }, [fullTitle, description, keywords, image, url, type, price, currency, availability, brand, category]);

  return null;
};

export default SEOHead;