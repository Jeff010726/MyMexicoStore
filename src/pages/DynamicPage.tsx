import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicPageRenderer from '@/components/DynamicPageRenderer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

const DynamicPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<PageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // 模拟模板数据（实际应该从API获取）
  const mockTemplates: PageTemplate[] = [
    {
      id: '1',
      name: '经典首页模板',
      description: '适合日用品商城的经典首页布局',
      category: 'homepage',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        {
          id: '1',
          type: 'hero',
          props: {
            title: '优质日用品，品质生活',
            subtitle: '精选好物，实惠价格，让生活更美好',
            buttonText: '立即购买',
            backgroundColor: '#1e40af',
            textColor: '#ffffff',
            textAlign: 'center'
          }
        },
        {
          id: '2',
          type: 'categories',
          props: {
            title: '商品分类',
            columns: 4,
            backgroundColor: '#f8fafc'
          }
        },
        {
          id: '3',
          type: 'products',
          props: {
            title: '热销商品',
            limit: 8,
            columns: 4,
            showPrice: true,
            showRating: true
          }
        },
        {
          id: '4',
          type: 'features',
          props: {
            title: '我们的优势',
            columns: 3,
            showIcons: true
          }
        },
        {
          id: '5',
          type: 'testimonials',
          props: {
            title: '客户评价',
            backgroundColor: '#f1f5f9',
            showStars: true
          }
        },
        {
          id: '6',
          type: 'newsletter',
          props: {
            title: '订阅我们的优惠信息',
            subtitle: '第一时间获取最新优惠和产品信息',
            placeholder: '请输入您的邮箱',
            buttonText: '立即订阅',
            backgroundColor: '#1e293b',
            textColor: '#ffffff'
          }
        }
      ],
      createdAt: '2024-08-01',
      updatedAt: '2024-08-15',
      isDefault: true,
      usageCount: 25
    },
    {
      id: '2',
      name: '促销活动模板',
      description: '专门用于促销活动的页面模板',
      category: 'custom',
      thumbnail: '/placeholder.svg?height=200&width=300',
      components: [
        {
          id: '1',
          type: 'countdown',
          props: {
            title: '🔥 限时抢购 🔥',
            backgroundColor: '#dc2626',
            textColor: '#ffffff'
          }
        },
        {
          id: '2',
          type: 'banner',
          props: {
            title: '全场8折起',
            subtitle: '精选商品，超值优惠，错过再等一年！',
            backgroundColor: '#ec4899',
            textColor: '#ffffff'
          }
        },
        {
          id: '3',
          type: 'products',
          props: {
            title: '今日特价',
            limit: 6,
            columns: 3,
            showPrice: true,
            showRating: true
          }
        }
      ],
      createdAt: '2024-08-14',
      updatedAt: '2024-08-18',
      isDefault: false,
      usageCount: 15
    }
  ];

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(API_CONFIG.ENDPOINTS.TEMPLATE_BY_ID(templateId!));
      
      if (data.success && data.template) {
        setTemplate(data.template);
      } else {
        console.warn('API返回格式错误，使用模拟数据');
        const foundTemplate = mockTemplates.find(t => t.id === templateId);
        setTemplate(foundTemplate || null);
      }
    } catch (error) {
      console.error('获取模板数据失败:', error);
      // 错误时使用模拟数据
      const foundTemplate = mockTemplates.find(t => t.id === templateId);
      setTemplate(foundTemplate || null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-orange-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">正在加载页面</h2>
          <p className="text-gray-600">请稍候，正在为您准备精彩内容...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-8xl mb-6 animate-bounce">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">页面未找到</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            抱歉，您访问的页面模板不存在或已被删除。<br />
            让我们帮您找到想要的内容！
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🏠 返回首页
            </Button>
            <Button 
              onClick={() => navigate('/admin/templates')}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              📄 查看所有模板
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 预览模式工具栏 */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white px-6 py-3 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsPreviewMode(false)}
              className="bg-gray-700 hover:bg-gray-600 text-sm"
            >
              <ArrowLeft size={16} className="mr-2" />
              退出预览
            </Button>
            <div>
              <span className="font-medium">{template.name}</span>
              <span className="text-gray-400 ml-2">预览模式</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigate(`/admin/templates`)}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              <Edit size={16} className="mr-2" />
              编辑模板
            </Button>
          </div>
        </div>
      )}

      {/* 页面内容 */}
      <div className={isPreviewMode ? 'pt-16' : ''}>
        {!isPreviewMode && <Header />}
        
        <main>
          <DynamicPageRenderer template={template} />
        </main>
        
        {!isPreviewMode && <Footer />}
      </div>

      {/* 浮动操作按钮 */}
      {!isPreviewMode && (
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <Button
            onClick={() => setIsPreviewMode(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 shadow-lg"
            title="预览模式"
          >
            <Eye size={20} />
          </Button>
          <Button
            onClick={() => navigate(`/admin/templates`)}
            className="bg-green-600 hover:bg-green-700 rounded-full p-3 shadow-lg"
            title="编辑模板"
          >
            <Edit size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DynamicPage;