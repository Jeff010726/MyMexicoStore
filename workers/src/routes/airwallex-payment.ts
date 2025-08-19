import { Hono } from 'hono';
import type { Env } from '../types';
import { successResponse, errorResponse, validateRequired, generateId } from '../utils/response';

export const airwallexPaymentRouter = new Hono<{ Bindings: Env }>();

// Airwallex API配置
const AIRWALLEX_BASE_URL = 'https://api.airwallex.com';
const CLIENT_ID = 'BKEAudMyRCWVlwQ-TbhtOg';

interface AirwallexPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  merchant_order_id: string;
  return_url?: string;
  client_secret: string;
  status: string;
}

interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  merchant_order_id: string;
  return_url?: string;
  descriptor?: string;
  metadata?: Record<string, any>;
}

// 获取Airwallex访问令牌
async function getAirwallexToken(env: Env): Promise<string> {
  const response = await fetch(`${AIRWALLEX_BASE_URL}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      api_key: env.AIRWALLEX_API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Airwallex');
  }

  const data = await response.json();
  return data.token;
}

// 创建支付意图
async function createPaymentIntent(
  env: Env,
  token: string,
  paymentData: CreatePaymentIntentRequest
): Promise<AirwallexPaymentIntent> {
  const response = await fetch(`${AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      request_id: generateId(),
      amount: paymentData.amount,
      currency: paymentData.currency,
      merchant_order_id: paymentData.merchant_order_id,
      return_url: paymentData.return_url,
      descriptor: paymentData.descriptor || 'Ecommerce Purchase',
      metadata: paymentData.metadata || {},
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Airwallex API error: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
}

// 确认支付意图
async function confirmPaymentIntent(
  env: Env,
  token: string,
  paymentIntentId: string,
  paymentMethod: any
): Promise<AirwallexPaymentIntent> {
  const response = await fetch(`${AIRWALLEX_BASE_URL}/api/v1/pa/payment_intents/${paymentIntentId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      request_id: generateId(),
      payment_method: paymentMethod,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Airwallex confirmation error: ${errorData.message || 'Unknown error'}`);
  }

  return await response.json();
}

// 创建支付订单
airwallexPaymentRouter.post('/create-payment-intent', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['orderId', 'amount', 'currency']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    // 获取订单信息
    const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(body.orderId).first();
    if (!order) {
      return c.json(errorResponse('Order not found'), 404);
    }

    // 获取Airwallex访问令牌
    const token = await getAirwallexToken(c.env);

    // 创建支付意图
    const paymentIntent = await createPaymentIntent(c.env, token, {
      amount: Math.round(body.amount * 100), // Airwallex使用分为单位
      currency: body.currency || 'MXN', // 墨西哥比索
      merchant_order_id: body.orderId,
      return_url: body.return_url || `${c.req.url.split('/api')[0]}/payment/success`,
      descriptor: 'Ecommerce Purchase',
      metadata: {
        order_id: body.orderId,
        customer_id: order.userId,
      },
    });

    // 保存支付记录到KV
    await c.env.ORDERS_KV.put(
      `airwallex_payment:${paymentIntent.id}`,
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        order_id: body.orderId,
        amount: body.amount,
        currency: body.currency || 'MXN',
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        created_at: new Date().toISOString(),
      }),
      { expirationTtl: 3600 } // 1小时过期
    );

    return c.json(successResponse({
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: body.amount,
      currency: body.currency || 'MXN',
      status: paymentIntent.status,
    }));
  } catch (error) {
    console.error('Create payment intent error:', error);
    return c.json(errorResponse('Failed to create payment intent'), 500);
  }
});

// 确认支付
airwallexPaymentRouter.post('/confirm-payment', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['payment_intent_id', 'payment_method']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    // 获取支付记录
    const paymentRecord = await c.env.ORDERS_KV.get(`airwallex_payment:${body.payment_intent_id}`);
    if (!paymentRecord) {
      return c.json(errorResponse('Payment intent not found'), 404);
    }

    const payment = JSON.parse(paymentRecord);

    // 获取Airwallex访问令牌
    const token = await getAirwallexToken(c.env);

    // 确认支付意图
    const confirmedPayment = await confirmPaymentIntent(
      c.env,
      token,
      body.payment_intent_id,
      body.payment_method
    );

    // 更新支付记录
    payment.status = confirmedPayment.status;
    payment.updated_at = new Date().toISOString();
    await c.env.ORDERS_KV.put(`airwallex_payment:${body.payment_intent_id}`, JSON.stringify(payment));

    // 如果支付成功，更新订单状态
    if (confirmedPayment.status === 'SUCCEEDED') {
      await c.env.DB.prepare(`
        UPDATE orders SET status = 'paid', paymentId = ?, paymentMethod = 'airwallex', updatedAt = ? WHERE id = ?
      `).bind(body.payment_intent_id, new Date().toISOString(), payment.order_id).run();
    }

    return c.json(successResponse({
      payment_intent_id: confirmedPayment.id,
      status: confirmedPayment.status,
      amount: payment.amount,
      currency: payment.currency,
    }));
  } catch (error) {
    console.error('Confirm payment error:', error);
    return c.json(errorResponse('Failed to confirm payment'), 500);
  }
});

// Webhook处理
airwallexPaymentRouter.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    
    // 验证webhook签名（生产环境中必须实现）
    // const signature = c.req.header('x-signature');
    // if (!verifyWebhookSignature(body, signature, c.env.AIRWALLEX_WEBHOOK_SECRET)) {
    //   return c.json(errorResponse('Invalid signature'), 401);
    // }

    const { name, data } = body;

    if (name === 'payment_intent.succeeded') {
      const paymentIntentId = data.object.id;
      
      // 获取支付记录
      const paymentRecord = await c.env.ORDERS_KV.get(`airwallex_payment:${paymentIntentId}`);
      if (paymentRecord) {
        const payment = JSON.parse(paymentRecord);
        
        // 更新订单状态为已支付
        await c.env.DB.prepare(`
          UPDATE orders SET status = 'paid', paymentId = ?, paymentMethod = 'airwallex', updatedAt = ? WHERE id = ?
        `).bind(paymentIntentId, new Date().toISOString(), payment.order_id).run();

        // 更新支付记录状态
        payment.status = 'SUCCEEDED';
        payment.updated_at = new Date().toISOString();
        await c.env.ORDERS_KV.put(`airwallex_payment:${paymentIntentId}`, JSON.stringify(payment));
      }
    } else if (name === 'payment_intent.payment_failed') {
      const paymentIntentId = data.object.id;
      
      // 获取支付记录
      const paymentRecord = await c.env.ORDERS_KV.get(`airwallex_payment:${paymentIntentId}`);
      if (paymentRecord) {
        const payment = JSON.parse(paymentRecord);
        
        // 更新支付记录状态
        payment.status = 'FAILED';
        payment.updated_at = new Date().toISOString();
        await c.env.ORDERS_KV.put(`airwallex_payment:${paymentIntentId}`, JSON.stringify(payment));
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json(errorResponse('Webhook processing failed'), 500);
  }
});

// 查询支付状态
airwallexPaymentRouter.get('/payment-status/:paymentIntentId', async (c) => {
  try {
    const paymentIntentId = c.req.param('paymentIntentId');
    
    const paymentRecord = await c.env.ORDERS_KV.get(`airwallex_payment:${paymentIntentId}`);
    if (!paymentRecord) {
      return c.json(errorResponse('Payment not found'), 404);
    }

    const payment = JSON.parse(paymentRecord);
    return c.json(successResponse({
      payment_intent_id: paymentIntentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      order_id: payment.order_id,
    }));
  } catch (error) {
    console.error('Get payment status error:', error);
    return c.json(errorResponse('Failed to get payment status'), 500);
  }
});

// 获取支持的支付方式（针对墨西哥市场）
airwallexPaymentRouter.get('/payment-methods', async (c) => {
  try {
    // 墨西哥常用的支付方式
    const paymentMethods = [
      {
        type: 'card',
        name: '信用卡/借记卡',
        description: 'Visa, Mastercard, American Express',
        currencies: ['MXN', 'USD'],
        icon: 'credit-card'
      },
      {
        type: 'oxxo',
        name: 'OXXO',
        description: '墨西哥最大的便利店支付网络',
        currencies: ['MXN'],
        icon: 'store'
      },
      {
        type: 'spei',
        name: 'SPEI银行转账',
        description: '墨西哥银行间电子支付系统',
        currencies: ['MXN'],
        icon: 'bank'
      }
    ];

    return c.json(successResponse(paymentMethods));
  } catch (error) {
    console.error('Get payment methods error:', error);
    return c.json(errorResponse('Failed to get payment methods'), 500);
  }
});