import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentIntentId = searchParams.get('payment_intent_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentIntentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/airwallex/payment-status/${paymentIntentId}`);
        const result = await response.json();
        
        if (result.success) {
          setPaymentDetails(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在确认支付状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* 成功头部 */}
          <div className="bg-green-50 border-b border-green-200 p-8 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-green-900 mb-2">支付成功！</h1>
            <p className="text-green-700">
              感谢您的购买，我们已收到您的付款并将尽快处理您的订单。
            </p>
          </div>

          {/* 订单详情 */}
          <div className="p-8">
            {paymentDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      订单信息
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">订单号:</span>
                        <span className="font-medium text-gray-900">{paymentDetails.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">支付金额:</span>
                        <span className="font-medium text-gray-900">
                          ${paymentDetails.amount} {paymentDetails.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">支付状态:</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          已支付
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      支付信息
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">支付方式:</span>
                        <span className="font-medium text-gray-900">Airwallex</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">交易ID:</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {paymentDetails.payment_intent_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">支付时间:</span>
                        <span className="font-medium text-gray-900">
                          {new Date().toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 下一步操作 */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">接下来会发生什么？</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">订单确认</h4>
                        <p className="text-sm text-gray-600">
                          我们将在5分钟内向您发送订单确认邮件
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">订单处理</h4>
                        <p className="text-sm text-gray-600">
                          我们将在1-2个工作日内处理并发货您的订单
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">物流跟踪</h4>
                        <p className="text-sm text-gray-600">
                          发货后您将收到物流跟踪信息
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`/orders/${orderId || paymentDetails?.order_id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Package size={20} />
                  <span>查看订单详情</span>
                  <ArrowRight size={16} />
                </Link>
                
                <Link
                  to="/"
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home size={20} />
                  <span>返回首页</span>
                </Link>
              </div>
            </div>

            {/* 客服信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">需要帮助？</h4>
              <p className="text-sm text-gray-600 mb-3">
                如果您对订单有任何疑问，请随时联系我们的客服团队。
              </p>
              <div className="flex flex-col sm:flex-row gap-2 text-sm">
                <span className="text-gray-600">客服邮箱: support@example.com</span>
                <span className="text-gray-600">客服电话: +52 55 1234 5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;