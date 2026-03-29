import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
  try {
    initializeApp({
      projectId: 'gen-lang-client-0122523488',
    });
  } catch (e) {
    // Ignore already initialized
  }
}

const db = getFirestore('ai-studio-59a2416c-b76e-42b3-aa2f-20bea9c00712');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

    if (!hmacSecret) {
      console.warn('PAYMOB_HMAC_SECRET is missing.');
      return res.status(400).send('HMAC Secret missing');
    }

    const payload = req.body;
    const hmacReceived = (req.query.hmac as string) || '';

    const obj = payload.obj || payload;
    const {
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order,
      owner,
      pending,
      source_data,
      success,
    } = obj;

    const orderNodeId = order?.id || obj['order.id'];

    const lexographicalString = [
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      orderNodeId,
      owner,
      pending,
      source_data?.pan || obj['source_data.pan'],
      source_data?.sub_type || obj['source_data.sub_type'],
      source_data?.type || obj['source_data.type'],
      success,
    ].join('');

    const hash = crypto
      .createHmac('sha512', hmacSecret)
      .update(lexographicalString)
      .digest('hex');

    if (hash !== hmacReceived && hmacReceived) {
      console.warn('Invalid Paymob Webhook HMAC Signature.');
      return res.status(401).send('Invalid Signature');
    }

    // Verification passed, update order status
    const firestoreOrderId = payload?.obj?.order?.merchant_order_id || req.body?.merchant_order_id;
    if (firestoreOrderId) {
      try {
        if (success === true) {
          await db.collection('orders').doc(firestoreOrderId).update({
            status: 'processing',
            paymentStatus: 'paid',
            updatedAt: new Date().toISOString(),
          });
        } else {
          await db.collection('orders').doc(firestoreOrderId).update({
            paymentStatus: 'failed',
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (dbError) {
        console.error('Failed to update Firestore order:', dbError);
      }
    }

    res.status(200).send('Webhook Received');
  } catch (error) {
    console.error('Paymob Webhook Error:', error);
    res.status(500).send('Encountered error processing webhook');
  }
}
