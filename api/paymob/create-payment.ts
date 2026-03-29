import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, items, orderId, billingData } = req.body;
    const apiKey = process.env.PAYMOB_API_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;
    const iframeId = process.env.PAYMOB_IFRAME_ID || '1009794';

    if (!apiKey || !integrationId) {
      return res.status(500).json({ error: 'Paymob credentials not configured on server.', missing: { apiKey: !apiKey, integrationId: !integrationId } });
    }

    const PAYMOB_BASE = 'https://accept.paymobsolutions.com';

    // Step 1: Authentication
    const authRes = await fetch(`${PAYMOB_BASE}/api/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    if (!token) {
      return res.status(400).json({ error: 'Failed to authenticate with Paymob', step: 'auth', details: authData });
    }

    // Step 2: Order Registration
    const orderRes = await fetch(`${PAYMOB_BASE}/api/ecommerce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: 'false',
        amount_cents: String(Math.round(amount * 100)),
        currency: 'EGP',
        merchant_order_id: orderId,
        items: items || [],
      }),
    });
    const orderData = await orderRes.json();
    const paymobOrderId = orderData.id;

    if (!paymobOrderId) {
      return res.status(400).json({ error: 'Failed to register order with Paymob', step: 'order', details: orderData });
    }

    // Step 3: Payment Key Generation
    const paymentKeyPayload = {
      auth_token: token,
      amount_cents: String(Math.round(amount * 100)),
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: Number(integrationId),
    };

    const paymentKeyRes = await fetch(`${PAYMOB_BASE}/api/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentKeyPayload),
    });
    const paymentKeyData = await paymentKeyRes.json();
    const paymentToken = paymentKeyData.token;

    if (!paymentToken) {
      return res.status(400).json({ 
        error: `Paymob Step 3 Error: ${paymentKeyData.message || paymentKeyData.detail || JSON.stringify(paymentKeyData)}`,
        step: 'payment_key',
        statusCode: paymentKeyRes.status,
        details: paymentKeyData,
        sentPayload: { ...paymentKeyPayload, auth_token: '***HIDDEN***' }
      });
    }

    // Step 4: Return Iframe URL
    const iframeUrl = `${PAYMOB_BASE}/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
    res.json({ iframeUrl });
  } catch (error: any) {
    console.error('Paymob Create Payment Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error', stack: error.stack });
  }
}
