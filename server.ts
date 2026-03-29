import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import admin from "firebase-admin";

// Load env vars
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin (uses Application Default Credentials)
try {
  admin.initializeApp();
} catch (e) {
  // Ignore already initialized errors
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ==========================================
  // Paymob Payment Integration
  // ==========================================

  // 1. Create Payment Endpoint
  app.post("/api/paymob/create-payment", async (req, res) => {
    try {
      const { amount, items, orderId, billingData } = req.body;
      const apiKey = process.env.PAYMOB_API_KEY;
      const integrationId = process.env.PAYMOB_INTEGRATION_ID;
      const iframeId = process.env.PAYMOB_IFRAME_ID || "1009794";

      if (!apiKey || !integrationId) {
         return res.status(500).json({ error: "Paymob credentials not configured." });
      }

      // Step 1: Authentication
      const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
      });
      const authData = await authRes.json();
      const token = authData.token;

      // Step 2: Order Registration
      const orderRes = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: token,
          delivery_needed: "false",
          amount_cents: String(Math.round(amount * 100)),
          currency: "EGP",
          merchant_order_id: orderId,
          items: items || [],
        }),
      });
      const orderData = await orderRes.json();
      const paymobOrderId = orderData.id;

      // Step 3: Payment Key Generation
      const paymentKeyRes = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: token,
          amount_cents: String(Math.round(amount * 100)),
          expiration: 3600,
          order_id: paymobOrderId,
          billing_data: billingData,
          currency: "EGP",
          integration_id: integrationId,
        }),
      });
      const paymentKeyData = await paymentKeyRes.json();
      const paymentToken = paymentKeyData.token;

      if (!paymentToken) {
         return res.status(400).json({ error: "Failed to generate payment token", details: paymentKeyData });
      }

      // Step 4: Return Iframe URL
      const iframeUrl = `https://accept-alpha.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
      res.json({ iframeUrl });
    } catch (error: any) {
      console.error("Paymob Create Payment Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Webhook Endpoint
  app.post("/api/paymob/webhook", async (req, res) => {
    try {
      const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
      
      if (!hmacSecret) {
         console.warn("PAYMOB_HMAC_SECRET is missing. Cannot verify webhook signatures.");
         return res.status(400).send("HMAC Secret missing");
      }

      // The query string object contains the parameters sent by Paymob:
      const queryParams = req.query;
      
      // If Paymob sends the data in body instead:
      const payload = req.body;
      const hmacReceived = req.query.hmac || "";

      // We handle Server-to-Server callbacks (Transaction Processed)
      // Paymob calculates HMAC using a specific concatenated string of the request payload attributes:
      // For `transaction_processed` callback:
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

      const orderNodeId = order?.id || obj["order.id"];
      
      // Paymob HMAC verification logic requires concatenating fields in alphabetical order
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
        source_data?.pan || obj["source_data.pan"],
        source_data?.sub_type || obj["source_data.sub_type"],
        source_data?.type || obj["source_data.type"],
        success,
      ].join('');

      const hash = crypto
        .createHmac("sha512", hmacSecret)
        .update(lexographicalString)
        .digest("hex");

      if (hash !== hmacReceived && hmacReceived) {
         console.warn("Invalid Paymob Webhook HMAC Signature.");
         return res.status(401).send("Invalid Signature");
      }

      // Verification passed, update order status
      const firestoreOrderId = payload?.obj?.order?.merchant_order_id || req.body?.merchant_order_id;
      if (firestoreOrderId) {
        if (success === true) {
           await db.collection("orders").doc(firestoreOrderId).update({
              status: "processing",
              paymentStatus: "paid",
              updatedAt: new Date().toISOString()
           });
        } else {
           await db.collection("orders").doc(firestoreOrderId).update({
              paymentStatus: "failed",
              updatedAt: new Date().toISOString()
           });
        }
      }

      res.status(200).send("Webhook Received");
    } catch (error) {
      console.error("Paymob Webhook Error:", error);
      res.status(500).send("Encountered error processing webhook");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
