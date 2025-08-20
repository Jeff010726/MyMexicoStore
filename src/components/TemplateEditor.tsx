import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PropertyEditor from './PropertyEditor';

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
  thumbnail: string;
  components: ComponentConfig[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  usageCount: number;
}

interface TemplateEditorProps {
  template: PageTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PageTemplate) => void;
  isNew?: boolean;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isOpen,
  onClose,
  onSave,
  isNew = false
}) => {
  const [formData, setFormData] = useState<PageTemplate>(
    template || {
      id: '',
      name: '',
      description: '',
      category: 'custom',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isDefault: false,
      usageCount: 0
    }
  );

  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // 可用组件库
  const componentLibrary = [
    {
      type: 'hero',
      name: '🎯 英雄横幅',
      description: '大图横幅，适合首页顶部',
      defaultProps: {
        title: '欢迎来到我们的商城',
        subtitle: '发现优质商品，享受购物乐趣',
        buttonText: '立即购买',
        backgroundImage: '/placeholder.svg?height=400&width=800',
        textAlign: 'center',
        backgroundColor: '#1e40af',
        textColor: '#ffffff'
      }
    },
    {
      type: 'categories',
      name: '📂 商品分类',
      description: '展示商品分类导航',
      defaultProps: {
        title: '商品分类',
        layout: 'grid',
        columns: 4,
        showIcons: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      type: 'products',
      name: '📦 商品展示',
      description: '商品列表展示组件',
      defaultProps: {
        title: '热销商品',
        limit: 8,
        layout: 'grid',
        showPrice: true,
        showRating: true,
        columns: 4
      }
    },
    {
      type: 'banner',
      name: '🎨 广告横幅',
      description: '促销广告横幅',
      defaultProps: {
        title: '限时优惠',
        subtitle: '全场8折起',
        image: '/placeholder.svg?height=200&width=800',
        linkUrl: '/products',
        backgroundColor: '#ec4899',
        textColor: '#ffffff'
      }
    },
    {
      type: 'text',
      name: '📝 文本内容',
      description: '纯文本内容块',
      defaultProps: {
        content: '这里是文本内容',
        fontSize: '16px',
        textAlign: 'left',
        color: '#333333',
        fontWeight: 'normal',
        lineHeight: '1.6'
      }
    },
    {
      type: 'image',
      name: '🖼️ 图片展示',
      description: '单张图片展示',
      defaultProps: {
        src: '/placeholder.svg?height=300&width=600',
        alt: '图片描述',
        width: '100%',
        height: 'auto',
        borderRadius: '8px'
      }
    },
    {
      type: 'button',
      name: '🔘 按钮组件',
      description: '可点击的按钮',
      defaultProps: {
        text: '点击按钮',
        style: 'primary',
        size: 'medium',
        linkUrl: '#',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff'
      }
    },
    {
      type: 'spacer',
      name: '📏 间距组件',
      description: '添加垂直间距',
      defaultProps: {
        height: '40px',
        backgroundColor: 'transparent'
      }
    },
    {
      type: 'testimonials',
      name: '💬 客户评价',
      description: '展示客户评价和反馈',
      defaultProps: {
        title: '客户评价',
        layout: 'carousel',
        showStars: true,
        backgroundColor: '#f1f5f9'
      }
    },
    {
      type: 'newsletter',
      name: '📧 邮件订阅',
      description: '邮件订阅表单',
      defaultProps: {
        title: '订阅我们的优惠信息',
        subtitle: '第一时间获取最新优惠和产品信息',
        placeholder: '请输入您的邮箱',
        buttonText: '立即订阅',
        backgroundColor: '#1e293b',
        textColor: '#ffffff'
      }
    },
    {
      type: 'features',
      name: '⭐ 特色功能',
      description: '展示产品特色和优势',
      defaultProps: {
        title: '我们的优势',
        layout: 'grid',
        columns: 3,
        showIcons: true
      }
    },
    {
      type: 'countdown',
      name: '⏰ 倒计时',
      description: '活动倒计时组件',
      defaultProps: {
        title: '限时抢购',
        endTime: '2024-12-31T23:59:59',
        backgroundColor: '#dc2626',
        textColor: '#ffffff'
      }
    },
    {
      type: 'gallery',
      name: '🖼️ 图片画廊',
      description: '多图展示画廊',
      defaultProps: {
        title: '产品展示',
        layout: 'masonry',
        columns: 3,
        showTitles: true
      }
    },
    {
      type: 'contact',
      name: '📞 联系信息',
      description: '联系方式展示',
      defaultProps: {
        title: '联系我们',
        showPhone: true,
        showEmail: true,
        showAddress: true,
        backgroundColor: '#f8fafc'
      }
    },
    {
      type: 'faq',
      name: '❓ 常见问题',
      description: '常见问题解答',
      defaultProps: {
        title: '常见问题',
        layout: 'accordion',
        showSearch: true
      }
    }
  ];

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else if (isNew) {
      setFormData({
        id: '',
        name: '',
        description: '',
        category: 'custom',
        thumbnail: '/placeholder.svg?height=200&width=300',
        components: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isDefault: false,
        usageCount: 0
      });
    }
  }, [template, isNew]);

  const handleAddComponent = (componentType: any) => {
    const newComponent: ComponentConfig = {
      id: Date.now().toString(),
      type: componentType.type,
      props: { ...componentType.defaultProps }
    };
    
    setFormData(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
    
    setShowComponentLibrary(false);
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<ComponentConfig>) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    }));
  };

  const handleDeleteComponent = (componentId: string) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }));
    setSelectedComponent(null);
  };

  const handleMoveComponent = (componentId: string, direction: 'up' | 'down') => {
    const components = [...formData.components];
    const index = components.findIndex(comp => comp.id === componentId);
    
    if (direction === 'up' && index > 0) {
      [components[index], components[index - 1]] = [components[index - 1], components[index]];
    } else if (direction === 'down' && index < components.length - 1) {
      [components[index], components[index + 1]] = [components[index + 1], components[index]];
    }
    
    setFormData(prev => ({ ...prev, components }));
  };

  const handleDuplicateComponent = (component: ComponentConfig) => {
    const newComponent: ComponentConfig = {
      ...component,
      id: Date.now().toString()
    };
    
    const index = formData.components.findIndex(comp => comp.id === component.id);
    const newComponents = [...formData.components];
    newComponents.splice(index + 1, 0, newComponent);
    
    setFormData(prev => ({ ...prev, components: newComponents }));
  };

  const handleSave = () => {
    const templateToSave = {
      ...formData,
      id: formData.id || Date.now().toString(),
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    onSave(templateToSave);
    onClose();
  };

  const renderComponentPreview = (component: ComponentConfig) => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center rounded">
            <h1 className="text-2xl font-bold mb-2">{component.props.title}</h1>
            <p className="mb-4">{component.props.subtitle}</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded">
              {component.props.buttonText}
            </button>
          </div>
        );
      case 'categories':
        return (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">{component.props.title}</h2>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center p-2 bg-gray-100 rounded">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <span className="text-sm">分类 {i}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">{component.props.title}</h2>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="border rounded p-2">
                  <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                  <div className="text-sm font-medium">商品 {i}</div>
                  <div className="text-sm text-gray-600">¥99.00</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'banner':
        return (
          <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white p-6 text-center rounded">
            <h2 className="text-xl font-bold">{component.props.title}</h2>
            <p>{component.props.subtitle}</p>
          </div>
        );
      case 'text':
        return (
          <div className="p-4 border rounded">
            <p style={{ 
              fontSize: component.props.fontSize,
              textAlign: component.props.textAlign,
              color: component.props.color
            }}>
              {component.props.content}
            </p>
          </div>
        );
      case 'image':
        return (
          <div className="p-4 border rounded">
            <img 
              src={component.props.src} 
              alt={component.props.alt}
              className="w-full h-32 object-cover rounded"
            />
          </div>
        );
      case 'button':
        return (
          <div className="p-4 border rounded text-center">
            <button className={`px-4 py-2 rounded ${
              component.props.style === 'primary' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {component.props.text}
            </button>
          </div>
        );
      case 'spacer':
        return (
          <div 
            className="border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500"
            style={{ 
              height: component.props.height,
              backgroundColor: component.props.backgroundColor 
            }}
          >
            间距: {component.props.height}
          </div>
        );
      case 'testimonials':
        return (
          <div className="p-6 border rounded" style={{ backgroundColor: component.props.backgroundColor }}>
            <h2 className="text-lg font-semibold mb-4 text-center">{component.props.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">客户 {i}</div>
                      <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">这是一个很好的产品，质量很棒！</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'newsletter':
        return (
          <div className="p-6 text-center rounded" style={{ 
            backgroundColor: component.props.backgroundColor,
            color: component.props.textColor 
          }}>
            <h2 className="text-xl font-bold mb-2">{component.props.title}</h2>
            <p className="mb-4">{component.props.subtitle}</p>
            <div className="flex max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={component.props.placeholder}
                className="flex-1 px-4 py-2 rounded-l border text-gray-900"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-r">
                {component.props.buttonText}
              </button>
            </div>
          </div>
        );
      case 'features':
        return (
          <div className="p-6 border rounded">
            <h2 className="text-lg font-semibold mb-6 text-center">{component.props.title}</h2>
            <div className="grid grid-cols-3 gap-6">
              {['快速配送', '品质保证', '售后服务'].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600">✓</span>
                  </div>
                  <h3 className="font-medium mb-2">{feature}</h3>
                  <p className="text-sm text-gray-600">优质的{feature}体验</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'countdown':
        return (
          <div className="p-6 text-center rounded" style={{ 
            backgroundColor: component.props.backgroundColor,
            color: component.props.textColor 
          }}>
            <h2 className="text-xl font-bold mb-4">{component.props.title}</h2>
            <div className="flex justify-center space-x-4">
              {['23', '15', '42', '08'].map((num, i) => (
                <div key={i} className="bg-white bg-opacity-20 rounded p-3">
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-sm">
                    {['天', '时', '分', '秒'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-4">{component.props.title}</h2>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="p-6 border rounded" style={{ backgroundColor: component.props.backgroundColor }}>
            <h2 className="text-lg font-semibold mb-4">{component.props.title}</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="mr-3">📞</span>
                <span>+52 55 1234 5678</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3">📧</span>
                <span>contact@example.com</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3">📍</span>
                <span>墨西哥城，墨西哥</span>
              </div>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="p-6 border rounded">
            <h2 className="text-lg font-semibold mb-4">{component.props.title}</h2>
            <div className="space-y-3">
              {['如何下单？', '配送时间？', '退换货政策？'].map((question, i) => (
                <div key={i} className="border rounded p-3">
                  <div className="font-medium flex items-center justify-between">
                    {question}
                    <span>▼</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 border rounded bg-gray-100">
            <span className="text-gray-600">未知组件: {component.type}</span>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isNew ? '创建新模板' : '编辑模板'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {previewMode ? '预览模式' : '编辑模式'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye size={16} className="mr-2" />
              {previewMode ? '编辑' : '预览'}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              <Save size={16} className="mr-2" />
              保存模板
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧面板 */}
          {!previewMode && (
            <div className="w-80 border-r flex flex-col">
              {/* 模板基本信息 */}
              <div className="p-4 border-b">
                <h3 className="font-medium mb-3">模板信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      模板名称
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入模板名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      模板描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="请输入模板描述"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      模板分类
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        category: e.target.value as PageTemplate['category']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="homepage">🏠 首页模板</option>
                      <option value="product">📦 商品页模板</option>
                      <option value="category">📂 分类页模板</option>
                      <option value="about">ℹ️ 关于页模板</option>
                      <option value="custom">🎨 自定义模板</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 组件库 */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">组件库</h3>
                  <Button
                    onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                    className="bg-green-600 hover:bg-green-700 text-sm px-3 py-1"
                  >
                    <Plus size={14} className="mr-1" />
                    添加
                  </Button>
                </div>
                
                {showComponentLibrary && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {componentLibrary.map((comp) => (
                      <div
                        key={comp.type}
                        onClick={() => handleAddComponent(comp)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-sm">{comp.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{comp.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 组件属性编辑 */}
              {selectedComponent && (
                <div className="p-4 flex-1 overflow-y-auto">
                  <PropertyEditor
                    component={selectedComponent}
                    onUpdate={(updates) => handleUpdateComponent(selectedComponent.id, updates)}
                  />
                </div>
              )}
            </div>
          )}

          {/* 主编辑区域 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {formData.components.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <Plus size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">暂无组件，请从左侧组件库添加</p>
                  </div>
                ) : (
                  formData.components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`relative group ${
                        selectedComponent?.id === component.id ? 'ring-2 ring-pink-500' : ''
                      }`}
                      onClick={() => !previewMode && setSelectedComponent(component)}
                    >
                      {renderComponentPreview(component)}
                      
                      {!previewMode && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1 bg-white rounded shadow-lg p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveComponent(component.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              title="上移"
                            >
                              ↑
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveComponent(component.id, 'down');
                              }}
                              disabled={index === formData.components.length - 1}
                              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                              title="下移"
                            >
                              ↓
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateComponent(component);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="复制"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComponent(component.id);
                              }}
                              className="p-1 text-red-600 hover:text-red-900"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;