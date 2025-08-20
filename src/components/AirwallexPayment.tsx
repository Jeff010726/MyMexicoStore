import { useState, useEffect } from 'react';
import { CreditCard, Store, Building, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PaymentMethod {
  type: string;
  name: string;
  description: string;
  currencies: string[];
  icon: string;
}

interface AirwallexPaymentProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

const AirwallexPayment = ({ orderId, amount, currency = 'MXN', onSuccess, onError }: AirwallexPaymentProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [, setClientSecret] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // 获取支持的支付方式
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('https://ecommerce-api.jeff010726bd.workers.dev/airwallex/payment-methods');
        const result = await response.json();
        if (result.success) {
          setPaymentMethods(result.data);
          if (result.data.length > 0) {
            setSelectedMethod(result.data[0].type);
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, []);

  // 创建支付意图
  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ecommerce-api.jeff010726bd.workers.dev/airwallex/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          return_url: `${window.location.origin}/payment/success`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPaymentIntentId(result.data.payment_intent_id);
        setClientSecret(result.data.client_secret);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Create payment intent error:', error);
      onError(error instanceof Error ? error.message : 'Payment initialization failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 处理支付确认
  const handlePayment = async () => {
    if (!paymentIntentId) {
      const intent = await createPaymentIntent();
      if (!intent) return;
    }

    try {
      setLoading(true);
      setPaymentStatus('processing');

      let paymentMethod;

      if (selectedMethod === 'card') {
        // 信用卡支付
        paymentMethod = {
          type: 'card',
          card: {
            number: cardDetails.number.replace(/\s/g, ''),
            expiry_month: cardDetails.expiry.split('/')[0],
            expiry_year: '20' + cardDetails.expiry.split('/')[1],
            cvc: cardDetails.cvc,
            name: cardDetails.name,
          },
        };
      } else if (selectedMethod === 'oxxo') {
        // OXXO支付
        paymentMethod = {
          type: 'oxxo',
        };
      } else if (selectedMethod === 'spei') {
        // SPEI银行转账
        paymentMethod = {
          type: 'spei',
        };
      }

      const response = await fetch('https://ecommerce-api.jeff010726bd.workers.dev/airwallex/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method: paymentMethod,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (result.data.status === 'SUCCEEDED') {
          setPaymentStatus('success');
          onSuccess(result.data.payment_intent_id);
        } else if (result.data.status === 'REQUIRES_PAYMENT_METHOD') {
          // 需要额外的支付步骤（如3D Secure）
          setPaymentStatus('processing');
        } else {
          setPaymentStatus('failed');
          onError('Payment failed');
        }
      } else {
        setPaymentStatus('failed');
        onError(result.error || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (iconType: string) => {
    switch (iconType) {
      case 'credit-card':
        return <CreditCard size={24} />;
      case 'store':
        return <Store size={24} />;
      case 'bank':
        return <Building size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">支付成功！</h3>
        <p className="text-gray-600">您的订单已成功支付，我们将尽快处理您的订单。</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center py-8">
        <XCircle className="mx-auto text-red-600 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">支付失败</h3>
        <p className="text-gray-600 mb-4">支付过程中出现问题，请重试或选择其他支付方式。</p>
        <button
          onClick={() => setPaymentStatus('idle')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新支付
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择支付方式</h3>
      
      {/* 订单信息 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">订单金额:</span>
          <span className="text-xl font-bold text-gray-900">
            ${amount.toFixed(2)} {currency}
          </span>
        </div>
      </div>

      {/* 支付方式选择 */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <label
            key={method.type}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.type}
              checked={selectedMethod === method.type}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3 flex-1">
              <div className={`text-gray-600 ${selectedMethod === method.type ? 'text-blue-600' : ''}`}>
                {getMethodIcon(method.icon)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* 信用卡表单 */}
      {selectedMethod === 'card' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              持卡人姓名
            </label>
            <input
              type="text"
              value={cardDetails.name}
              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入持卡人姓名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              卡号
            </label>
            <input
              type="text"
              value={cardDetails.number}
              onChange={(e) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                有效期
              </label>
              <input
                type="text"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVC
              </label>
              <input
                type="text"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* OXXO支付说明 */}
      {selectedMethod === 'oxxo' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">OXXO支付说明</h4>
          <p className="text-sm text-blue-800">
            点击确认后，您将收到一个支付凭证，请前往任意OXXO便利店完成支付。
          </p>
        </div>
      )}

      {/* SPEI银行转账说明 */}
      {selectedMethod === 'spei' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-900 mb-2">SPEI银行转账说明</h4>
          <p className="text-sm text-green-800">
            点击确认后，您将收到银行转账信息，请通过您的网银或手机银行完成转账。
          </p>
        </div>
      )}

      {/* 支付按钮 */}
      <button
        onClick={handlePayment}
        disabled={loading || paymentStatus === 'processing'}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading || paymentStatus === 'processing' ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>处理中...</span>
          </>
        ) : (
          <span>确认支付 ${amount.toFixed(2)} {currency}</span>
        )}
      </button>

      {/* 安全提示 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 您的支付信息通过SSL加密传输，安全可靠
        </p>
      </div>
    </div>
  );
};

export default AirwallexPayment;