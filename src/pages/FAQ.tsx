import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Package, CreditCard, User, Truck, RefreshCw } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // 订单相关
  {
    id: 'order-1',
    question: '如何查看我的订单状态？',
    answer: '您可以登录账户后，在"用户中心"的"订单历史"中查看所有订单的详细状态。我们会实时更新订单状态，包括待处理、已支付、已发货、已送达等。',
    category: 'orders'
  },
  {
    id: 'order-2',
    question: '订单发货后多久能收到？',
    answer: '发货时间因地区而异：墨西哥境内通常3-5个工作日，其他拉美国家5-10个工作日。您会收到包含追踪号码的发货通知邮件。',
    category: 'orders'
  },
  {
    id: 'order-3',
    question: '可以修改或取消已提交的订单吗？',
    answer: '订单提交后30分钟内可以取消或修改。超过此时间，如果订单尚未发货，请联系客服协助处理。已发货订单无法取消，但可以申请退货。',
    category: 'orders'
  },
  {
    id: 'order-4',
    question: '如何申请退货或换货？',
    answer: '收到商品后30天内可申请退货。商品需保持原包装和标签完整。在用户中心的订单详情页点击"申请退货"，填写退货原因并上传照片。',
    category: 'orders'
  },

  // 支付相关
  {
    id: 'payment-1',
    question: '支持哪些支付方式？',
    answer: '我们支持主要信用卡（Visa、MasterCard、American Express）、借记卡、PayPal以及当地银行转账。所有支付都通过Airwallex安全处理。',
    category: 'payment'
  },
  {
    id: 'payment-2',
    question: '支付安全吗？',
    answer: '是的，我们使用Airwallex支付平台，符合PCI DSS标准，采用256位SSL加密技术保护您的支付信息。我们不会存储您的信用卡信息。',
    category: 'payment'
  },
  {
    id: 'payment-3',
    question: '支付失败怎么办？',
    answer: '支付失败可能由于网络问题、银行限制或卡片信息错误。请检查卡片信息，确保余额充足，或尝试其他支付方式。如仍有问题请联系客服。',
    category: 'payment'
  },
  {
    id: 'payment-4',
    question: '如何申请退款？',
    answer: '退款会原路返回到您的支付账户。信用卡退款通常3-5个工作日到账，PayPal退款1-2个工作日。银行转账退款可能需要5-10个工作日。',
    category: 'payment'
  },

  // 账户相关
  {
    id: 'account-1',
    question: '如何注册账户？',
    answer: '点击页面右上角"注册"按钮，填写邮箱、密码和基本信息即可。注册后会收到验证邮件，点击链接激活账户。',
    category: 'account'
  },
  {
    id: 'account-2',
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"，输入注册邮箱，我们会发送重置密码链接到您的邮箱。按照邮件指引重置密码即可。',
    category: 'account'
  },
  {
    id: 'account-3',
    question: '如何修改个人信息？',
    answer: '登录后进入"用户中心"，在"个人资料"页面可以修改姓名、电话、地址等信息。修改邮箱需要验证新邮箱地址。',
    category: 'account'
  },
  {
    id: 'account-4',
    question: '可以删除账户吗？',
    answer: '可以的。请发送邮件至info@aimorelogy.com申请删除账户。我们会在7个工作日内处理您的请求并删除相关数据。',
    category: 'account'
  },

  // 配送相关
  {
    id: 'shipping-1',
    question: '配送费用如何计算？',
    answer: '配送费用根据商品重量、体积和配送地址计算。墨西哥境内满$50免运费，其他地区满$100免运费。具体费用在结账时显示。',
    category: 'shipping'
  },
  {
    id: 'shipping-2',
    question: '可以指定配送时间吗？',
    answer: '目前暂不支持指定具体配送时间，但您可以选择工作日配送或周末配送。我们会在配送前一天通过短信或邮件通知您。',
    category: 'shipping'
  },
  {
    id: 'shipping-3',
    question: '配送到哪些地区？',
    answer: '我们主要配送到墨西哥全境，同时覆盖哥伦比亚、阿根廷、智利、秘鲁等拉美主要国家。具体可配送地区请在结账时查看。',
    category: 'shipping'
  },
  {
    id: 'shipping-4',
    question: '如何追踪包裹？',
    answer: '发货后您会收到包含追踪号码的邮件。可以在我们网站的"订单追踪"页面或承运商官网输入追踪号查看包裹状态。',
    category: 'shipping'
  },

  // 产品相关
  {
    id: 'product-1',
    question: '商品质量有保证吗？',
    answer: '我们所有商品都经过严格质量检测，提供质量保证。如收到有质量问题的商品，30天内可免费退换，运费由我们承担。',
    category: 'product'
  },
  {
    id: 'product-2',
    question: '商品图片与实物不符怎么办？',
    answer: '我们努力确保商品图片的准确性，但可能存在色差。如果实物与描述严重不符，您可以申请退货，我们承担退货运费。',
    category: 'product'
  },
  {
    id: 'product-3',
    question: '有新品上架通知吗？',
    answer: '有的！您可以在用户中心订阅新品通知，或关注我们的社交媒体账号。我们会定期推送新品信息和优惠活动。',
    category: 'product'
  }
];

const categories = [
  { id: 'all', name: '全部', icon: Search },
  { id: 'orders', name: '订单相关', icon: Package },
  { id: 'payment', name: '支付问题', icon: CreditCard },
  { id: 'account', name: '账户管理', icon: User },
  { id: 'shipping', name: '配送服务', icon: Truck },
  { id: 'product', name: '商品相关', icon: RefreshCw }
];


const FAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">常见问题</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            找不到答案？请查看下面的常见问题，或直接联系我们的客服团队。
          </p>
        </div>

        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 分类标签 */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredFAQs.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredFAQs.map((item) => (
                <div key={item.id} className="p-6">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg p-2 -m-2"
                  >
                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp className="flex-shrink-0 text-gray-500" size={20} />
                    ) : (
                      <ChevronDown className="flex-shrink-0 text-gray-500" size={20} />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.id) && (
                    <div className="mt-4 pr-8">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关问题</h3>
              <p className="text-gray-600 mb-6">
                尝试使用不同的关键词搜索，或浏览其他分类。
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看全部问题
              </button>
            </div>
          )}
        </div>

        {/* 联系客服 */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">还有其他问题？</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            如果您没有找到需要的答案，我们的客服团队随时为您提供帮助。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              联系我们
            </a>
            <a
              href="mailto:info@aimorelogy.com"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
            >
              发送邮件
            </a>
          </div>
        </div>

        {/* 快速链接 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">订单追踪</h3>
            <p className="text-gray-600 text-sm mb-4">
              实时查看您的订单状态和配送进度
            </p>
            <a href="/user-center" className="text-blue-600 hover:text-blue-800 font-medium">
              查看订单 →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">退换货</h3>
            <p className="text-gray-600 text-sm mb-4">
              简单快捷的退换货流程，30天无忧退货
            </p>
            <a href="/user-center" className="text-blue-600 hover:text-blue-800 font-medium">
              申请退货 →
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <User className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">账户管理</h3>
            <p className="text-gray-600 text-sm mb-4">
              管理个人信息、地址和支付方式
            </p>
            <a href="/user-center" className="text-blue-600 hover:text-blue-800 font-medium">
              个人中心 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;