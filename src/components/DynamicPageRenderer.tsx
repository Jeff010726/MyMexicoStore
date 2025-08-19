import React from 'react';
import { Button } from '@/components/ui/button';

interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, any>;
}

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'homepage' | 'product' | 'category' | 'about' | 'custom';
  components: ComponentConfig[];
}

interface DynamicPageRendererProps {
  template: PageTemplate;
  className?: string;
}

const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({ template, className = '' }) => {
  const renderComponent = (component: ComponentConfig) => {
    const { type, props } = component;

    switch (type) {
      case 'hero':
        return (
          <section 
            className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 text-center overflow-hidden"
            style={{ 
              backgroundColor: props.backgroundColor || '#1e40af',
              color: props.textColor || '#ffffff',
              backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            <div className="relative max-w-5xl mx-auto">
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight animate-fade-in"
                style={{ textAlign: props.textAlign || 'center' }}
              >
                {props.title}
              </h1>
              <p 
                className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay"
                style={{ textAlign: props.textAlign || 'center' }}
              >
                {props.subtitle}
              </p>
              {props.buttonText && (
                <div className="animate-fade-in-delay-2">
                  <Button 
                    className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = props.linkUrl || '#'}
                  >
                    {props.buttonText}
                  </Button>
                </div>
              )}
            </div>
          </section>
        );

      case 'categories':
        return (
          <section 
            className="py-16 px-6"
            style={{ backgroundColor: props.backgroundColor || '#f8fafc' }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(props.columns || 4, 4)} gap-4 md:gap-6`}>
                {['🏠 家居用品', '🍳 厨房用具', '🧴 个人护理', '🧽 清洁用品', '👕 服装配饰', '📱 数码配件', '🎮 娱乐用品', '📚 文具办公'].slice(0, props.columns * 2 || 8).map((category, index) => (
                  <div key={index} className="text-center p-4 md:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105">
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{category.split(' ')[0]}</div>
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">{category.split(' ')[1]}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'products':
        return (
          <section className="py-12 md:py-16 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(props.columns || 4, 4)} gap-4 md:gap-6`}>
                {Array.from({ length: props.limit || 8 }, (_, index) => {
                  const price = (Math.random() * 100 + 20).toFixed(2);
                  const originalPrice = (parseFloat(price) + Math.random() * 50 + 20).toFixed(2);
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
                      <div className="aspect-square bg-gray-200 relative overflow-hidden">
                        <img 
                          src={`/placeholder.svg?height=300&width=300&text=商品${index + 1}`}
                          alt={`商品 ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          热销
                        </div>
                        {Math.random() > 0.7 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            新品
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-medium text-gray-900 mb-2 text-sm md:text-base line-clamp-2">优质日用品 {index + 1}</h3>
                        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">高品质生活必需品，性价比超高，让生活更美好</p>
                        {props.showPrice && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 md:space-x-2">
                              <span className="text-base md:text-lg font-bold text-red-600">¥{price}</span>
                              <span className="text-xs md:text-sm text-gray-500 line-through">¥{originalPrice}</span>
                            </div>
                            {props.showRating && (
                              <div className="text-yellow-400 text-xs md:text-sm">
                                ⭐⭐⭐⭐⭐
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-orange-500 transition-colors">
                            立即购买
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case 'banner':
        return (
          <section 
            className="py-12 px-6 text-center"
            style={{ 
              backgroundColor: props.backgroundColor || '#ec4899',
              color: props.textColor || '#ffffff'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
              <p className="text-xl mb-6">{props.subtitle}</p>
              {props.linkUrl && (
                <Button 
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  onClick={() => window.location.href = props.linkUrl}
                >
                  立即查看
                </Button>
              )}
            </div>
          </section>
        );

      case 'text':
        return (
          <section className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div 
                style={{
                  fontSize: props.fontSize || '16px',
                  textAlign: props.textAlign || 'left',
                  color: props.color || '#333333',
                  fontWeight: props.fontWeight || 'normal',
                  lineHeight: props.lineHeight || '1.6'
                }}
                className="prose max-w-none"
              >
                {props.content}
              </div>
            </div>
          </section>
        );

      case 'image':
        return (
          <section className="py-8 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src={props.src}
                alt={props.alt}
                style={{
                  width: props.width || '100%',
                  height: props.height || 'auto',
                  borderRadius: props.borderRadius || '8px'
                }}
                className="mx-auto"
              />
            </div>
          </section>
        );

      case 'button':
        return (
          <section className="py-8 px-6 text-center">
            <Button
              style={{
                backgroundColor: props.backgroundColor || '#3b82f6',
                color: props.textColor || '#ffffff'
              }}
              className={`${props.size === 'large' ? 'px-8 py-4 text-lg' : props.size === 'small' ? 'px-4 py-2 text-sm' : 'px-6 py-3'}`}
              onClick={() => window.location.href = props.linkUrl || '#'}
            >
              {props.text}
            </Button>
          </section>
        );

      case 'spacer':
        return (
          <div 
            style={{ 
              height: props.height || '40px',
              backgroundColor: props.backgroundColor || 'transparent'
            }}
          />
        );

      case 'testimonials':
        return (
          <section 
            className="py-16 px-6"
            style={{ backgroundColor: props.backgroundColor || '#f1f5f9' }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { name: 'María González', rating: 5, comment: '产品质量很好，配送也很快！' },
                  { name: 'Carlos Rodríguez', rating: 5, comment: '性价比很高，会继续购买。' },
                  { name: 'Ana Martínez', rating: 4, comment: '服务态度很好，推荐给朋友。' }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                        {props.showStars && (
                          <div className="text-yellow-400">
                            {'⭐'.repeat(testimonial.rating)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section 
            className="py-16 px-6 text-center"
            style={{ 
              backgroundColor: props.backgroundColor || '#1e293b',
              color: props.textColor || '#ffffff'
            }}
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">{props.title}</h2>
              <p className="text-xl mb-8 opacity-90">{props.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email"
                  placeholder={props.placeholder}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3">
                  {props.buttonText}
                </Button>
              </div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className={`grid grid-cols-1 md:grid-cols-${props.columns || 3} gap-8`}>
                {[
                  { icon: '🚚', title: '快速配送', desc: '24小时内发货，3-5天送达' },
                  { icon: '✅', title: '品质保证', desc: '严格质检，品质有保障' },
                  { icon: '🔄', title: '售后服务', desc: '7天无理由退换，贴心服务' },
                  { icon: '💰', title: '价格优惠', desc: '厂家直销，价格实惠' },
                  { icon: '🎁', title: '积分奖励', desc: '购物积分，兑换好礼' },
                  { icon: '📞', title: '客服支持', desc: '24小时在线客服' }
                ].slice(0, props.columns || 3).map((feature, index) => (
                  <div key={index} className="text-center p-6">
                    {props.showIcons && (
                      <div className="text-5xl mb-4">{feature.icon}</div>
                    )}
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'countdown':
        return (
          <section 
            className="py-16 px-6 text-center"
            style={{ 
              backgroundColor: props.backgroundColor || '#dc2626',
              color: props.textColor || '#ffffff'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">{props.title}</h2>
              <div className="flex justify-center space-x-6">
                {[
                  { value: '23', label: '天' },
                  { value: '15', label: '时' },
                  { value: '42', label: '分' },
                  { value: '08', label: '秒' }
                ].map((item, index) => (
                  <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 min-w-[80px]">
                    <div className="text-3xl font-bold">{item.value}</div>
                    <div className="text-sm opacity-90">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className={`grid grid-cols-2 md:grid-cols-${props.columns || 3} gap-4`}>
                {Array.from({ length: 9 }, (_, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={`/placeholder.svg?height=300&width=300&text=图片${index + 1}`}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section 
            className="py-16 px-6"
            style={{ backgroundColor: props.backgroundColor || '#f8fafc' }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {props.showPhone && (
                  <div className="p-6">
                    <div className="text-4xl mb-4">📞</div>
                    <h3 className="font-semibold mb-2">电话咨询</h3>
                    <p className="text-gray-600">+52 55 1234 5678</p>
                  </div>
                )}
                {props.showEmail && (
                  <div className="p-6">
                    <div className="text-4xl mb-4">📧</div>
                    <h3 className="font-semibold mb-2">邮箱联系</h3>
                    <p className="text-gray-600">contact@example.com</p>
                  </div>
                )}
                {props.showAddress && (
                  <div className="p-6">
                    <div className="text-4xl mb-4">📍</div>
                    <h3 className="font-semibold mb-2">地址</h3>
                    <p className="text-gray-600">墨西哥城，墨西哥</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'faq':
        return (
          <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {props.title}
              </h2>
              {props.showSearch && (
                <div className="mb-8">
                  <input 
                    type="text"
                    placeholder="搜索问题..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              )}
              <div className="space-y-4">
                {[
                  { q: '如何下单购买？', a: '选择商品后点击加入购物车，然后进入结算页面完成支付即可。' },
                  { q: '配送需要多长时间？', a: '一般情况下，我们会在24小时内发货，3-5个工作日内送达。' },
                  { q: '支持哪些支付方式？', a: '我们支持信用卡、借记卡等多种支付方式。' },
                  { q: '可以退换货吗？', a: '支持7天无理由退换货，商品需保持原包装完好。' }
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button className="w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                      {faq.q}
                      <span className="text-gray-400">▼</span>
                    </button>
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return (
          <div className="py-8 px-6 bg-gray-100 text-center">
            <p className="text-gray-600">未知组件类型: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`dynamic-page ${className}`}>
      {template.components.map((component) => (
        <div key={component.id}>
          {renderComponent(component)}
        </div>
      ))}
    </div>
  );
};

export default DynamicPageRenderer;