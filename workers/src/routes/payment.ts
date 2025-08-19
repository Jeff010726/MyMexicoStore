import { Hono } from 'hono';
import type { Env, PaymentRequest, PaymentResponse } from '../types';
import { successResponse, errorResponse, validateRequired, generateId } from '../utils/response';

export const paymentRouter = new Hono<{ Bindings: Env }>();

// 创建支付订单
paymentRouter.post('/create', async (c) => {
  try {
    const body = await c.req.json();
    
    const validation = validateRequired(body, ['orderId', 'amount', 'method']);
    if (validation) {
      return c.json(errorResponse(validation), 400);
    }

    const paymentRequest: PaymentRequest = {
      orderId: body.orderId,
      amount: parseFloat(body.amount),
      method: body.method,
      returnUrl: body.returnUrl || `${c.req.url}/return`,
      notifyUrl: body.notifyUrl || `${c.req.url}/notify`
    };

    let paymentResponse: PaymentResponse;

    if (paymentRequest.method === 'alipay') {
      paymentResponse = await createAlipayOrder(c.env, paymentRequest);
    } else if (paymentRequest.method === 'wechat') {
      paymentResponse = await createWechatOrder(c.env, paymentRequest);
    } else {
      return c.json(errorResponse('Unsupported payment method'), 400);
    }

    // 保存支付记录到KV
    await c.env.ORDERS_KV.put(
      `payment:${paymentResponse.paymentId}`,
      JSON.stringify({
        ...paymentRequest,
        paymentId: paymentResponse.paymentId,
        status: paymentResponse.status,
        createdAt: new Date().toISOString()
      }),
      { expirationTtl: 3600 } // 1小时过期
    );

    return c.json(successResponse(paymentResponse));
  } catch (error) {
    console.error('Create payment error:', error);
    return c.json(errorResponse('Failed to create payment'), 500);
  }
});

// 支付回调处理
paymentRouter.post('/notify/:method', async (c) => {
  try {
    const method = c.req.param('method');
    const body = await c.req.text();

    let isValid = false;
    let paymentId = '';
    let status = '';

    if (method === 'alipay') {
      const result = await verifyAlipayCallback(c.env, body);
      isValid = result.isValid;
      paymentId = result.paymentId;
      status = result.status;
    } else if (method === 'wechat') {
      const result = await verifyWechatCallback(c.env, body);
      isValid = result.isValid;
      paymentId = result.paymentId;
      status = result.status;
    }

    if (!isValid) {
      return c.json(errorResponse('Invalid callback'), 400);
    }

    // 更新支付状态
    const paymentRecord = await c.env.ORDERS_KV.get(`payment:${paymentId}`);
    if (paymentRecord) {
      const payment = JSON.parse(paymentRecord);
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      
      await c.env.ORDERS_KV.put(`payment:${paymentId}`, JSON.stringify(payment));

      // 更新订单状态
      if (status === 'success') {
        await c.env.DB.prepare(`
          UPDATE orders SET status = 'paid', paymentId = ?, updatedAt = ? WHERE id = ?
        `).bind(paymentId, new Date().toISOString(), payment.orderId).run();
      }
    }

    return c.text('success');
  } catch (error) {
    console.error('Payment callback error:', error);
    return c.text('fail');
  }
});

// 查询支付状态
paymentRouter.get('/status/:paymentId', async (c) => {
  try {
    const paymentId = c.req.param('paymentId');
    
    const paymentRecord = await c.env.ORDERS_KV.get(`payment:${paymentId}`);
    if (!paymentRecord) {
      return c.json(errorResponse('Payment not found'), 404);
    }

    const payment = JSON.parse(paymentRecord);
    return c.json(successResponse({
      paymentId,
      status: payment.status,
      amount: payment.amount,
      method: payment.method
    }));
  } catch (error) {
    console.error('Get payment status error:', error);
    return c.json(errorResponse('Failed to get payment status'), 500);
  }
});

// 支付宝支付实现（简化版）
async function createAlipayOrder(env: Env, request: PaymentRequest): Promise<PaymentResponse> {
  const paymentId = generateId();
  
  // 这里应该调用支付宝API创建订单
  // 简化实现，实际需要使用支付宝SDK
  return {
    paymentId,
    paymentUrl: `https://openapi.alipay.com/gateway.do?payment_id=${paymentId}`,
    status: 'created'
  };
}

// 微信支付实现（简化版）
async function createWechatOrder(env: Env, request: PaymentRequest): Promise<PaymentResponse> {
  const paymentId = generateId();
  
  // 这里应该调用微信支付API创建订单
  // 简化实现，实际需要使用微信支付SDK
  return {
    paymentId,
    qrCode: `weixin://wxpay/bizpayurl?pr=${paymentId}`,
    status: 'created'
  };
}

// 验证支付宝回调（简化版）
async function verifyAlipayCallback(env: Env, body: string) {
  // 实际实现需要验证签名
  return {
    isValid: true,
    paymentId: 'mock-payment-id',
    status: 'success'
  };
}

// 验证微信支付回调（简化版）
async function verifyWechatCallback(env: Env, body: string) {
  // 实际实现需要验证签名
  return {
    isValid: true,
    paymentId: 'mock-payment-id',
    status: 'success'
  };
}