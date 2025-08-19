import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Copy, Download, Upload, Layers, Save, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import TemplateEditor from '@/components/TemplateEditor';
import { apiRequest, API_CONFIG } from '@/config/api';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'homepage' | 'product' | 'category' | 'about' | 'custom';
  thumbnail: string;
  components: any[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  usageCount: number;
}

const TemplateManagement = () => {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  // 模拟模板数据
  const mockTemplates: PageTemplate[] = [
    {
      id: '1',
      name: '经典首页模板',
      description: '适合日用品商城的经典首页布局，包含轮播图、热销商品、分类导航等模块',
      category: 'homepage',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        { type: 'hero', props: { title: '优质日用品，品质生活', subtitle: '精选好物，实惠价格' } },
        { type: 'categories', props: { title: '商品分类' } },
        { type: 'products', props: { title: '热销商品', limit: 8 } },
        { type: 'banner', props: { title: '限时优惠', image: '/placeholder.svg?height=200&width=800' } }
      ],
      createdAt: '2024-08-01',
      updatedAt: '2024-08-15',
      isDefault: true,
      usageCount: 25
    },
    {
      id: '2',
      name: '商品展示模板',
      description: '专门用于商品详情页的模板，包含商品图片、详细信息、评价等',
      category: 'product',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        { type: 'product-gallery', props: {} },
        { type: 'product-info', props: {} },
        { type: 'product-description', props: {} },
        { type: 'related-products', props: { title: '相关商品' } }
      ],
      createdAt: '2024-08-05',
      updatedAt: '2024-08-18',
      isDefault: false,
      usageCount: 18
    },
    {
      id: '3',
      name: '分类页面模板',
      description: '商品分类页面模板，支持筛选、排序、分页等功能',
      category: 'category',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        { type: 'category-header', props: { title: '商品分类' } },
        { type: 'filters', props: {} },
        { type: 'product-grid', props: { columns: 4 } },
        { type: 'pagination', props: {} }
      ],
      createdAt: '2024-08-10',
      updatedAt: '2024-08-16',
      isDefault: false,
      usageCount: 12
    },
    {
      id: '4',
      name: '关于我们模板',
      description: '企业介绍页面模板，包含公司简介、团队介绍、联系方式等',
      category: 'about',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        { type: 'page-header', props: { title: '关于我们' } },
        { type: 'company-intro', props: {} },
        { type: 'team-section', props: {} },
        { type: 'contact-info', props: {} }
      ],
      createdAt: '2024-08-12',
      updatedAt: '2024-08-17',
      isDefault: false,
      usageCount: 8
    },
    {
      id: '5',
      name: '促销活动模板',
      description: '专门用于促销活动的页面模板，突出优惠信息和限时抢购',
      category: 'custom',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        { type: 'promo-banner', props: { title: '限时抢购', countdown: true } },
        { type: 'deal-products', props: { title: '今日特价' } },
        { type: 'coupon-section', props: {} },
        { type: 'countdown-timer', props: {} }
      ],
      createdAt: '2024-08-14',
      updatedAt: '2024-08-18',
      isDefault: false,
      usageCount: 15
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATES);
      if (data.success && data.templates) {
        setTemplates(data.templates);
      } else {
        console.warn('API返回格式错误，使用模拟数据');
        setTemplates(mockTemplates);
      }
    } catch (error) {
      console.error('获取模板数据失败:', error);
      setTemplates(mockTemplates); // 错误时使用模拟数据
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const labels = {
      homepage: '🏠 首页',
      product: '📦 商品页',
      category: '📂 分类页',
      about: 'ℹ️ 关于页',
      custom: '🎨 自定义'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      homepage: 'bg-blue-100 text-blue-800',
      product: 'bg-green-100 text-green-800',
      category: 'bg-purple-100 text-purple-800',
      about: 'bg-orange-100 text-orange-800',
      custom: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePreviewTemplate = (template: PageTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleDuplicateTemplate = async (template: PageTemplate) => {
    try {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (副本)`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isDefault: false,
        usageCount: 0
      };

      const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATES, {
        method: 'POST',
        body: JSON.stringify(newTemplate)
      });

      if (data.success && data.template) {
        setTemplates(prev => [...prev, data.template]);
      } else {
        // 如果API失败，仍然在前端添加（作为后备）
        setTemplates(prev => [...prev, newTemplate]);
      }
    } catch (error) {
      console.error('复制模板失败:', error);
      // 错误时仍然在前端添加
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (副本)`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isDefault: false,
        usageCount: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('确定要删除这个模板吗？此操作无法撤销。')) {
      try {
        const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATE_BY_ID(templateId), {
          method: 'DELETE'
        });

        if (data.success) {
          setTemplates(prev => prev.filter(t => t.id !== templateId));
        } else {
          // 如果API失败，仍然在前端删除（作为后备）
          setTemplates(prev => prev.filter(t => t.id !== templateId));
        }
      } catch (error) {
        console.error('删除模板失败:', error);
        // 错误时仍然在前端删除
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      }
    }
  };

  const handleEditTemplate = (template: PageTemplate) => {
    setSelectedTemplate(template);
    setIsNewTemplate(false);
    setShowEditor(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsNewTemplate(true);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (template: PageTemplate) => {
    try {
      if (isNewTemplate) {
        // 创建新模板
        const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATES, {
          method: 'POST',
          body: JSON.stringify(template)
        });

        if (data.success && data.template) {
          setTemplates(prev => [...prev, data.template]);
        } else {
          // API失败时的后备方案
          setTemplates(prev => [...prev, template]);
        }
      } else {
        // 更新现有模板
        const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATE_BY_ID(template.id), {
          method: 'PUT',
          body: JSON.stringify(template)
        });

        if (data.success && data.template) {
          setTemplates(prev => prev.map(t => t.id === template.id ? data.template : t));
        } else {
          // API失败时的后备方案
          setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        }
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      // 错误时的后备方案
      if (isNewTemplate) {
        setTemplates(prev => [...prev, template]);
      } else {
        setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      }
    } finally {
      setShowEditor(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载模板数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📄 页面模板</h1>
          <p className="text-gray-600 mt-1">管理和使用页面模板</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-blue-600">总模板数</div>
            <div className="text-xl font-bold text-blue-800">{templates.length}</div>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-green-600">默认模板</div>
            <div className="text-xl font-bold text-green-800">
              {templates.filter(t => t.isDefault).length}
            </div>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-purple-600">使用次数</div>
            <div className="text-xl font-bold text-purple-800">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="搜索模板名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">全部分类</option>
              <option value="homepage">首页模板</option>
              <option value="product">商品页模板</option>
              <option value="category">分类页模板</option>
              <option value="about">关于页模板</option>
              <option value="custom">自定义模板</option>
            </select>
            
            <Button 
              onClick={handleCreateTemplate}
              className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500"
            >
              <Plus size={16} className="mr-2" />
              创建模板
            </Button>
          </div>
        </div>
      </Card>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* 模板缩略图 */}
            <div className="relative">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              {template.isDefault && (
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    默认模板
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                  {getCategoryLabel(template.category)}
                </span>
              </div>
            </div>

            {/* 模板信息 */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye size={14} className="mr-1" />
                  {template.usageCount}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Layers size={14} className="mr-1" />
                  {template.components.length} 个组件
                </div>
                <div>
                  更新于 {new Date(template.updatedAt).toLocaleDateString('zh-CN')}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  <Eye size={14} className="mr-1" />
                  预览
                </Button>
                <Button
                  onClick={() => window.open(`/page/${template.id}`, '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-sm px-3"
                  title="查看页面"
                >
                  <ExternalLink size={14} />
                </Button>
                <Button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="bg-green-600 hover:bg-green-700 text-sm px-3"
                  title="复制模板"
                >
                  <Copy size={14} />
                </Button>
                <Button
                  onClick={() => handleEditTemplate(template)}
                  className="bg-orange-600 hover:bg-orange-700 text-sm px-3"
                  title="编辑模板"
                >
                  <Edit size={14} />
                </Button>
                {!template.isDefault && (
                  <Button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-600 hover:bg-red-700 text-sm px-3"
                    title="删除模板"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">没有找到匹配的模板</p>
        </div>
      )}

      {/* 模板预览弹窗 */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* 模板预览区域 */}
              <div className="border rounded-lg p-4 bg-gray-50 mb-6">
                <div className="bg-white rounded shadow-sm p-6">
                  <h3 className="text-lg font-medium mb-4">模板组件结构</h3>
                  <div className="space-y-3">
                    {selectedTemplate.components.map((component, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded flex items-center justify-center text-white text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{component.type}</div>
                          <div className="text-sm text-gray-500">
                            {component.props.title || '组件配置'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  关闭
                </Button>
                <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                  <Save size={16} className="mr-2" />
                  使用此模板
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模板编辑器 */}
      <TemplateEditor
        template={selectedTemplate}
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveTemplate}
        isNew={isNewTemplate}
      />
    </div>
  );
};

export default TemplateManagement;
