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
      return res.status(500).json({ error: 'Paymob credentials not configured on server.' });
    }

    // Step 1: Authentication
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    if (!token) {
      return res.status(400).json({ error: 'Failed to authenticate with Paymob', details: authData });
    }

    // Step 2: Order Registration
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
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
      return res.status(400).json({ error: 'Failed to register order with Paymob', details: orderData });
    }

    // Step 3: Payment Key Generation
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: String(Math.round(amount * 100)),
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: integrationId,
      }),
    });
    const paymentKeyData = await paymentKeyRes.json();
    const paymentToken = paymentKeyData.token;

    if (!paymentToken) {
      // Return specific error message from Paymob to help debug (e.g., "Invalid integration ID" or "Incomplete billing data")
      const errorMessage = paymentKeyData.message || paymentKeyData.detail || 'Failed to generate payment token';
      return res.status(400).json({ 
        error: `Paymob Error: ${errorMessage}`,
        details: paymentKeyData 
      });
    }

    // Step 4: Return Iframe URL
    const iframeUrl = `https://accept-alpha.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
    res.json({ iframeUrl });
  } catch (error: any) {
    console.error('Paymob Create Payment Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
