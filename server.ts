import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import "dotenv/config";
import { initializeApp as initializeFirebaseApp } from "firebase/app";
import {
  getFirestore as getJSFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc as updateJSDoc,
  serverTimestamp as jsServerTimestamp,
  increment as jsIncrement,
  limit as jsLimit,
  doc as jsDoc
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (for other services if needed, but not primary DB)
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
const dbIdFromConfig = (firebaseConfig.firestoreDatabaseId || "").trim();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Initialize Firebase JS SDK for server use (bypasses credential/IAM issues)
const jsApp = initializeFirebaseApp(firebaseConfig);
const db = dbIdFromConfig ? getJSFirestore(jsApp, dbIdFromConfig) : getJSFirestore(jsApp);

const FieldValue = {
  serverTimestamp: jsServerTimestamp,
  increment: jsIncrement
};

console.log(`Firestore (JS SDK) initialized. Project: ${firebaseConfig.projectId}, Database: ${dbIdFromConfig || "(default)"}`);

// ===============================================================
// Wompi configuration
// ===============================================================
const WOMPI_ENV = (process.env.WOMPI_ENV || "production").toLowerCase();
const WOMPI_API_BASE = WOMPI_ENV === "production"
  ? "https://production.wompi.co/v1"
  : "https://sandbox.wompi.co/v1";
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || "";
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || "";
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || "";
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const CURRENCY = "COP";

if (!WOMPI_PUBLIC_KEY || !WOMPI_INTEGRITY_SECRET) {
  console.warn("⚠️  Wompi keys are not fully configured. Set WOMPI_PUBLIC_KEY and WOMPI_INTEGRITY_SECRET in .env");
}

// Generate a human-friendly order serial e.g. FC-A1B2C3
function generateSerial(): string {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase().substring(0, 6);
  return `FC-${random}`;
}

// Integrity signature for Wompi Web Checkout:
// SHA256(reference + amountInCents + currency + integritySecret)
function buildIntegritySignature(reference: string, amountInCents: number): string {
  const raw = `${reference}${amountInCents}${CURRENCY}${WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function makeTransporter() {
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.resend.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER || "resend",
      pass: process.env.SMTP_PASS,
    },
  });
}

// Bootstrap: Ensure BIENVENIDO10 promo code exists
async function bootstrapPromoCodes() {
  const tryBootstrap = async (label: string) => {
    console.log(`Verifying Firestore connection on ${label} database...`);
    const promoRef = collection(db, "promoCodes");
    const q = query(promoRef, where("code", "==", "BIENVENIDO10"), jsLimit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`Bootstrapping BIENVENIDO10 promo code on ${label}...`);
      await addDoc(promoRef, {
        code: "BIENVENIDO10",
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        usageCount: 0,
        description: "Código de bienvenida para nuevos suscriptores"
      });
    }
    console.log(`Firestore connection verified on ${label} database.`);
    return true;
  };

  try {
    await tryBootstrap(dbIdFromConfig || "(default)");
  } catch (error: any) {
    console.error("Error bootstrapping promo codes with JS SDK:", error.message || error);
    // If it fails here, it might be due to rules or if the databaseId is wrong
  }
}

// ===============================================================
// Order confirmation email (sent ONLY after payment is approved)
// ===============================================================
async function sendOrderApprovedEmails(order: any) {
  const transporter = makeTransporter();
  const fromEmail = process.env.SMTP_FROM_VENTAS || '"Fly and Chill" <ventas@flyandchill.store>';
  const { shippingInfo, items } = order;
  const displaySerial = order.serial || `FC-${String(order.reference || "").toUpperCase()}`;

  const itemsHtml = (items || []).map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price).toLocaleString()}</td>
    </tr>
  `).join("");

  const subtotal = typeof order.subtotal === "number"
    ? order.subtotal
    : (items || []).reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const subscriptionFee = typeof order.subscriptionFee === "number" ? order.subscriptionFee : 5000;
  const discountAmount = order.discountAmount || 0;
  const total = order.total;

  const whatsappStatusUrl = `https://api.whatsapp.com/send?phone=573019202618&text=${encodeURIComponent(
    `Hola, quiero preguntar sobre el estado de mi pedido y fechas de entrega de mi pedido numero: ${displaySerial}`
  )}`;

  const mailOptions = {
    from: fromEmail,
    to: shippingInfo.email,
    subject: `✅ Pago confirmado — Pedido ${displaySerial}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align:center; margin-bottom: 10px;">
          <span style="display:inline-block; background:#e7f7ec; color:#1a8f3c; font-weight:900; padding:8px 18px; border-radius:50px; font-size:13px;">PAGO APROBADO</span>
        </div>
        <h2 style="color: #76bbca;">¡Gracias por tu compra, ${shippingInfo.firstName}! 🌿</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">Tu número de pedido es: <strong style="color: #76bbca;">${displaySerial}</strong></p>
        <p>Hemos recibido tu pago correctamente y ya estamos preparando tu pedido.</p>

        <h3 style="border-bottom: 2px solid #76bbca; padding-bottom: 5px;">Resumen del Pedido</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">Subtotal</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(subtotal).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">Suscripción Fly Club</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(subscriptionFee).toLocaleString()}</td>
          </tr>
          ${discountAmount > 0 ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; color:#1a8f3c;">Descuento${order.promoCode ? ` (${order.promoCode})` : ""}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color:#1a8f3c;">-$${Number(discountAmount).toLocaleString()}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 10px; font-weight: bold;">Total pagado</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #76bbca; font-size: 20px;">$${Number(total).toLocaleString()}</td>
          </tr>
        </table>

        <h3 style="border-bottom: 2px solid #76bbca; padding-bottom: 5px;">Datos de Envío</h3>
        <p style="margin: 5px 0;">${shippingInfo.firstName} ${shippingInfo.lastName}</p>
        <p style="margin: 5px 0;">${shippingInfo.address}</p>
        <p style="margin: 5px 0;">${shippingInfo.city}${shippingInfo.zipCode ? `, ${shippingInfo.zipCode}` : ""}</p>
        <p style="margin: 5px 0;">Tel: ${shippingInfo.phone}</p>

        <div style="text-align:center; margin: 30px 0;">
          <a href="${whatsappStatusUrl}" style="display:inline-block; background:#25D366; color:#fff; padding:14px 26px; border-radius:50px; font-weight:900; text-decoration:none; font-size:15px;">
            CONSULTAR ESTADO DE MI PEDIDO
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 14px; color: #888;">Si tienes alguna pregunta, no dudes en contactarnos.<br />El equipo de Fly and Chill</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Order approved email sent to customer for ${displaySerial}`);

  // Notify admin
  try {
    const adminMailOptions = {
      from: fromEmail,
      to: "flyandchill0@gmail.com",
      subject: `🟢 Nuevo pedido PAGADO — ${displaySerial}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a8f3c; border-radius: 10px;">
          <h2 style="color: #1a8f3c;">Pedido pagado vía Wompi</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #1a8f3c;">
            <p><strong>Pedido:</strong> ${displaySerial}</p>
            <p><strong>Cliente:</strong> ${shippingInfo.firstName} ${shippingInfo.lastName}</p>
            <p><strong>Email:</strong> ${shippingInfo.email}</p>
            <p><strong>Teléfono:</strong> ${shippingInfo.phone}</p>
            <p><strong>Dirección:</strong> ${shippingInfo.address}, ${shippingInfo.city}</p>
            <p><strong>Total pagado:</strong> $${Number(total).toLocaleString()}</p>
            <p><strong>ID Transacción Wompi:</strong> ${order.wompiTransactionId || "—"}</p>
          </div>
          <h3>Detalle de Productos:</h3>
          <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
        </div>
      `
    };
    await transporter.sendMail(adminMailOptions);
  } catch (err) {
    console.error("Error sending admin notification email:", err);
  }
}

// Find an order document by its Wompi reference (= serial)
async function findOrderByReference(reference: string) {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("reference", "==", reference), jsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ref: docSnap.ref, data: docSnap.data() as any };
}

// Map a Wompi status to our internal status + persist + send email once.
async function reconcileOrderWithTransaction(tx: any) {
  if (!tx || !tx.reference) return;
  const found = await findOrderByReference(tx.reference);
  if (!found) {
    console.warn(`No order found for reference ${tx.reference}`);
    return;
  }

  const wompiStatus = String(tx.status || "").toUpperCase(); // APPROVED, DECLINED, VOIDED, ERROR, PENDING
  const current = found.data;

  // Idempotency: if already approved + email sent, do nothing.
  if (current.paymentStatus === wompiStatus && current.emailSent) return;

  const internalStatus =
    wompiStatus === "APPROVED" ? "paid" :
    wompiStatus === "DECLINED" || wompiStatus === "ERROR" || wompiStatus === "VOIDED" ? "cancelled" :
    "pending";

  const updates: any = {
    paymentStatus: wompiStatus,
    status: internalStatus,
    wompiTransactionId: tx.id || current.wompiTransactionId || null,
    updatedAt: jsServerTimestamp(),
  };

  const shouldSendEmail = wompiStatus === "APPROVED" && !current.emailSent;
  if (shouldSendEmail) updates.emailSent = true;

  await updateJSDoc(found.ref, updates);

  if (shouldSendEmail) {
    try {
      await sendOrderApprovedEmails({ ...current, ...updates, id: found.id });
    } catch (err) {
      console.error("Error sending approved emails:", err);
    }
  }
}

async function startServer() {
  console.log("Starting server initialization...");

  // Await bootstrap to ensure connectivity
  await bootstrapPromoCodes().catch(err => console.error("Bootstrap failed:", err));

  console.log("Proceeding with server setup...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Expose the public (non-secret) Wompi config to the frontend
  app.get("/api/wompi/config", (req, res) => {
    res.json({ publicKey: WOMPI_PUBLIC_KEY, currency: CURRENCY, env: WOMPI_ENV });
  });

  // Newsletter Signup API
  app.post("/api/newsletter/signup", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      // 1. Save to Firestore 'leads' collection
      await addDoc(collection(db, "leads"), {
        email,
        signupDate: jsServerTimestamp(),
        source: "footer_newsletter",
        status: "potential_lead"
      });

      // 2. Send Welcome Email
      const transporter = makeTransporter();
      const fromEmail = process.env.SMTP_FROM_NEWSLETTER || '"Fly and Chill" <newsletter@flyandchill.store>';
      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: "¡Bienvenido a la familia Fly and Chill! 🌿",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #76bbca;">¡Bienvenido a la familia Fly and Chill! 🌿</h2>
            <p>¡Hola!</p>
            <p>Estamos muy felices de que te hayas unido a nuestra comunidad. En Fly and Chill, nos apasiona elevar el estándar del cannabis moderno.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #333;">📅 Evento Especial: 4/20</p>
              <p style="margin: 5px 0 0 0;">Recuerda que tenemos un evento especial este 20 de abril. ¡Prepárate para sorpresas exclusivas!</p>
            </div>
            <p>Como regalo de bienvenida, queremos que disfrutes de un <strong>10% OFF</strong> en tu primera compra.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #76bbca; color: #000; padding: 15px 30px; font-size: 24px; font-weight: 900; border-radius: 50px; letter-spacing: 2px;">BIENVENIDO10</span>
            </div>
            <p style="text-align: center; font-size: 12px; color: #666;">Usa este código al finalizar tu compra.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px; color: #888;">Saludos,<br />El equipo de Fly and Chill</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions).then(info => {
        console.log("Newsletter email sent: %s", info.messageId);
      }).catch(err => {
        console.error("Error sending newsletter email:", err);
      });

      res.json({ success: true, message: "¡Bienvenido! Revisa tu correo para tu regalo." });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      res.status(500).json({ error: "Hubo un error al procesar tu registro." });
    }
  });

  // ============================================================
  // Order Creation API — creates a PENDING order and returns the
  // data needed by the frontend to open Wompi Web Checkout.
  // No email is sent here; emails go out only once payment is APPROVED.
  // ============================================================
  app.post("/api/orders/create", async (req, res) => {
    const { orderData } = req.body;

    if (!orderData || !orderData.shippingInfo || !orderData.shippingInfo.email) {
      return res.status(400).json({ error: "Order data and customer email are required" });
    }

    try {
      const amountInCents = Math.round(Number(orderData.total) * 100);
      if (!Number.isFinite(amountInCents) || amountInCents < 150000) {
        // Wompi requires a minimum of 1.500 COP
        return res.status(400).json({ error: "El monto del pedido no es válido." });
      }

      const serial = generateSerial();
      const reference = serial; // unique reference used by Wompi

      // 1. Save to Firestore as PENDING
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: "anonymous",
        items: orderData.items,
        subtotal: orderData.subtotal ?? null,
        total: orderData.total,
        discountAmount: orderData.discountAmount ?? 0,
        promoCode: orderData.promoCode ?? null,
        shippingInfo: orderData.shippingInfo,
        paymentMethod: orderData.paymentMethod || "wompi",
        serial,
        reference,
        status: "pending",
        paymentStatus: "PENDING",
        emailSent: false,
        createdAt: jsServerTimestamp(),
      });

      // 1.5 Increment promo code usage if applicable
      if (orderData.promoCode) {
        try {
          const promoRef = collection(db, "promoCodes");
          const q = query(promoRef, where("code", "==", orderData.promoCode), jsLimit(1));
          const promoQuery = await getDocs(q);
          if (!promoQuery.empty) {
            await updateJSDoc(promoQuery.docs[0].ref, { usageCount: jsIncrement(1) });
          }
        } catch (promoErr: any) {
          console.error("Error updating promo code usage:", promoErr.message || promoErr);
        }
      }

      // 2. Build Wompi integrity signature (server-side, secret never leaves backend)
      const signature = buildIntegritySignature(reference, amountInCents);
      const redirectUrl = `${PUBLIC_BASE_URL}/checkout/confirmation`;

      res.json({
        success: true,
        orderId: orderRef.id,
        serial,
        reference,
        amountInCents,
        currency: CURRENCY,
        signature,
        publicKey: WOMPI_PUBLIC_KEY,
        redirectUrl,
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: "Hubo un error al procesar tu pedido." });
    }
  });

  // ============================================================
  // Transaction status — called by the confirmation page.
  // Reads the transaction from Wompi, reconciles the order and
  // returns the current status to the client.
  // ============================================================
  app.get("/api/wompi/transaction/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const wompiRes = await fetch(`${WOMPI_API_BASE}/transactions/${id}`);
      if (!wompiRes.ok) {
        return res.status(502).json({ error: "No se pudo consultar la transacción." });
      }
      const json: any = await wompiRes.json();
      const tx = json.data;

      await reconcileOrderWithTransaction(tx).catch(err => console.error("Reconcile error:", err));

      const order = tx?.reference ? await findOrderByReference(tx.reference) : null;

      res.json({
        status: tx?.status,
        reference: tx?.reference,
        amountInCents: tx?.amount_in_cents,
        paymentMethodType: tx?.payment_method_type,
        serial: order?.data?.serial || tx?.reference,
        order: order ? { id: order.id, ...order.data } : null,
      });
    } catch (error) {
      console.error("Transaction status error:", error);
      res.status(500).json({ error: "Error consultando el estado del pago." });
    }
  });

  // Look up an order by reference/serial (used as a fallback by the UI)
  app.get("/api/orders/by-reference/:reference", async (req, res) => {
    try {
      const order = await findOrderByReference(req.params.reference);
      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
      res.json({ id: order.id, ...order.data });
    } catch (error) {
      res.status(500).json({ error: "Error consultando el pedido." });
    }
  });

  // ============================================================
  // Wompi Events Webhook — server-to-server confirmation.
  // Configure this URL in the Wompi dashboard: <domain>/api/wompi/webhook
  // ============================================================
  app.post("/api/wompi/webhook", async (req, res) => {
    try {
      const event = req.body;
      const signature = event?.signature;
      const properties: string[] = signature?.properties || [];
      const timestamp = event?.timestamp;

      // Rebuild checksum: concat values of the listed properties + timestamp + events secret
      let concatenated = "";
      for (const prop of properties) {
        const value = prop.split(".").reduce((acc: any, key: string) => (acc ? acc[key] : undefined), event.data);
        concatenated += value;
      }
      concatenated += timestamp;
      concatenated += WOMPI_EVENTS_SECRET;

      const computed = crypto.createHash("sha256").update(concatenated).digest("hex");

      if (!signature?.checksum || computed.toLowerCase() !== String(signature.checksum).toLowerCase()) {
        console.warn("Wompi webhook: invalid checksum");
        return res.status(401).json({ error: "Invalid signature" });
      }

      if (event.event === "transaction.updated" && event.data?.transaction) {
        await reconcileOrderWithTransaction(event.data.transaction);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite dev server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (Wompi ${WOMPI_ENV})`);
  });
}

startServer();
