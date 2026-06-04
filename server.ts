import express from "express";
// NOTA: Vite se importa de forma dinámica SOLO en modo desarrollo (más abajo).
// Así el proceso de producción nunca carga Vite/esbuild/rollup en memoria.
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
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

const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
const dbIdFromConfig = (firebaseConfig.firestoreDatabaseId || "").trim();

// ===============================================================
// Firestore access — prefer the Admin SDK (service account) which
// bypasses security rules. This is the correct pattern for a
// server-side payment backend: it removes the dependency on
// deploying Firestore rules and prevents clients from forging
// orders. If no service account is available, fall back to the
// client JS SDK (which IS subject to the deployed rules).
// ===============================================================
function loadServiceAccount(): any | null {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    const candidates = [
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      path.join(process.cwd(), "service-account.json"),
    ].filter(Boolean) as string[];
    for (const p of candidates) {
      if (p && fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      }
    }
  } catch (e) {
    console.error("Could not load Firebase service account:", e);
  }
  return null;
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount), projectId: firebaseConfig.projectId }
      : { projectId: firebaseConfig.projectId }
  );
}

// Client JS SDK (fallback / browser-equivalent access)
const jsApp = initializeFirebaseApp(firebaseConfig);
const clientDb = dbIdFromConfig ? getJSFirestore(jsApp, dbIdFromConfig) : getJSFirestore(jsApp);

let useAdmin = false;
let adminDb: any = null;
if (serviceAccount) {
  try {
    adminDb = dbIdFromConfig ? getAdminFirestore(admin.app(), dbIdFromConfig) : getAdminFirestore(admin.app());
    useAdmin = true;
    console.log(`Firestore: using Admin SDK (service account). Project: ${firebaseConfig.projectId}, Database: ${dbIdFromConfig || "(default)"}`);
  } catch (e) {
    console.error("Admin Firestore init failed, falling back to client SDK:", e);
  }
}
if (!useAdmin) {
  console.log(`Firestore: using client JS SDK (subject to security rules). Project: ${firebaseConfig.projectId}, Database: ${dbIdFromConfig || "(default)"}`);
  console.warn("⚠️  No Firebase service account found. For production, set FIREBASE_SERVICE_ACCOUNT (or deploy firestore.rules) so order writes succeed.");
}

// ---- Firestore data-layer helpers (work with either SDK) ----
function svTimestamp(): any {
  return useAdmin ? admin.firestore.FieldValue.serverTimestamp() : jsServerTimestamp();
}
function svIncrement(n: number): any {
  return useAdmin ? admin.firestore.FieldValue.increment(n) : jsIncrement(n);
}
async function addDocument(coll: string, data: any): Promise<string> {
  if (useAdmin && adminDb) {
    const ref = await adminDb.collection(coll).add(data);
    return ref.id;
  }
  const ref = await addDoc(collection(clientDb, coll), data);
  return ref.id;
}
async function queryOne(coll: string, field: string, value: any): Promise<{ id: string; data: any } | null> {
  if (useAdmin && adminDb) {
    const snap = await adminDb.collection(coll).where(field, "==", value).limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, data: d.data() };
  }
  const snap = await getDocs(query(collection(clientDb, coll), where(field, "==", value), jsLimit(1)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, data: d.data() };
}
async function updateDocument(coll: string, id: string, updates: any): Promise<void> {
  if (useAdmin && adminDb) {
    await adminDb.collection(coll).doc(id).update(updates);
    return;
  }
  await updateJSDoc(jsDoc(clientDb, coll, id), updates);
}

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


const WHATSAPP_PHONE = "573019202618";

// Bootstrap: Ensure BIENVENIDO10 promo code exists
async function bootstrapPromoCodes() {
  try {
    const existing = await queryOne("promoCodes", "code", "BIENVENIDO10");
    if (!existing) {
      console.log("Bootstrapping BIENVENIDO10 promo code...");
      await addDocument("promoCodes", {
        code: "BIENVENIDO10",
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        usageCount: 0,
        description: "Código de bienvenida para nuevos suscriptores"
      });
    }
    console.log("Firestore connection verified.");
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes("PERMISSION_DENIED") || error?.code === "permission-denied") {
      // En modo cliente, sembrar el promo desde el servidor está bloqueado por
      // las reglas (es lo esperado). No es fatal: el promo ya existe en
      // Firestore o se gestiona desde el panel de Admin. Con cuenta de
      // servicio (Admin SDK) este aviso desaparece.
      console.warn("Bootstrap de promo omitido (modo cliente: escritura restringida por reglas). No es crítico.");
    } else {
      console.error("Error bootstrapping promo codes:", msg);
    }
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

  const whatsappStatusUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
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
  return queryOne("orders", "reference", reference);
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

  // Idempotency: if already in this status and email sent, do nothing.
  if (current.paymentStatus === wompiStatus && current.emailSent) return;

  const internalStatus =
    wompiStatus === "APPROVED" ? "paid" :
    wompiStatus === "DECLINED" || wompiStatus === "ERROR" || wompiStatus === "VOIDED" ? "cancelled" :
    "pending";

  const updates: any = {
    paymentStatus: wompiStatus,
    status: internalStatus,
    wompiTransactionId: tx.id || current.wompiTransactionId || null,
    updatedAt: svTimestamp(),
  };

  const shouldSendEmail = wompiStatus === "APPROVED" && !current.emailSent;
  if (shouldSendEmail) updates.emailSent = true;

  await updateDocument("orders", found.id, updates);

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

  await bootstrapPromoCodes().catch(err => console.error("Bootstrap failed:", err));

  console.log("Proceeding with server setup...");
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // El webhook de Wompi rara vez supera unos KB; limitar el body protege
  // memoria/CPU frente a payloads abusivos en una instancia pequeña.
  app.use(express.json({ limit: "1mb" }));

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", firestore: useAdmin ? "admin" : "client", timestamp: new Date().toISOString() });
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
      await addDocument("leads", {
        email,
        signupDate: svTimestamp(),
        source: "footer_newsletter",
        status: "potential_lead"
      });

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
  // Sugerencias de canciones de la comunidad — se guardan en
  // Firestore (colección songSuggestions) y aparecen en el panel
  // de Admin, sección Música.
  // ============================================================
  app.post("/api/community/song", async (req, res) => {
    const { song } = req.body;

    if (!song || typeof song !== "string" || !song.trim()) {
      return res.status(400).json({ error: "La canción es requerida" });
    }

    try {
      await addDocument("songSuggestions", {
        song: song.trim().slice(0, 500),
        createdAt: svTimestamp(),
        source: "community_playlist",
        status: "pending",
      });
      res.json({ success: true, message: "¡Canción sugerida! La revisaremos para la próxima playlist." });
    } catch (error) {
      console.error("Song suggestion error:", error);
      res.status(500).json({ error: "No se pudo registrar la sugerencia. Intenta de nuevo." });
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
        return res.status(400).json({ error: "El monto del pedido no es válido (mínimo $1.500 COP)." });
      }

      const serial = generateSerial();
      const reference = serial; // unique reference used by Wompi

      const orderId = await addDocument("orders", {
        userId: "anonymous",
        items: orderData.items,
        subtotal: orderData.subtotal ?? null,
        total: orderData.total,
        discountAmount: orderData.discountAmount ?? 0,
        promoCode: orderData.promoCode ?? null,
        shippingInfo: orderData.shippingInfo,
        billingInfo: orderData.billingInfo ?? orderData.shippingInfo,
        billingSameAsShipping: orderData.billingSameAsShipping ?? true,
        paymentMethod: orderData.paymentMethod || "wompi",
        serial,
        reference,
        status: "pending",
        paymentStatus: "PENDING",
        emailSent: false,
        createdAt: svTimestamp(),
      });

      // Increment promo code usage if applicable
      if (orderData.promoCode) {
        try {
          const promo = await queryOne("promoCodes", "code", orderData.promoCode);
          if (promo) {
            await updateDocument("promoCodes", promo.id, { usageCount: svIncrement(1) });
          }
        } catch (promoErr: any) {
          console.error("Error updating promo code usage:", promoErr.message || promoErr);
        }
      }

      // Build Wompi integrity signature (server-side, secret never leaves backend)
      const signature = buildIntegritySignature(reference, amountInCents);
      const redirectUrl = `${PUBLIC_BASE_URL}/checkout/confirmation`;

      res.json({
        success: true,
        orderId,
        serial,
        reference,
        amountInCents,
        currency: CURRENCY,
        signature,
        publicKey: WOMPI_PUBLIC_KEY,
        redirectUrl,
      });
    } catch (error: any) {
      console.error("Order creation error:", error?.message || error);
      res.status(500).json({ error: "Hubo un error al procesar tu pedido." });
    }
  });

  // ============================================================
  // Transaction status — called by the confirmation page.
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

  // ============================================================
  // Frontend serving
  //  - DEV: Vite middleware (HMR) — Vite se importa dinámicamente
  //    aquí para que el bundle de PRODUCCIÓN nunca lo cargue.
  //  - PROD: se sirven los archivos estáticos ya compilados (dist/),
  //    con cache agresivo en /assets (hashed) y sin-cache en el HTML.
  // ============================================================
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite dev server...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware attached (DEV mode).");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      console.error(`⚠️  No se encontró ${path.join(distPath, "index.html")}. Ejecuta "npm run build" antes de arrancar en producción.`);
    }
    const indexHtml = path.join(distPath, "index.html");

    // Archivos con hash en el nombre → cache inmutable de 1 año.
    app.use("/assets", express.static(path.join(distPath, "assets"), {
      immutable: true,
      maxAge: "1y",
    }));
    // Resto de estáticos (favicon, imágenes públicas, etc.)
    app.use(express.static(distPath, { maxAge: "1h", index: false }));

    // SPA fallback — nunca cachear el HTML para que los despliegues
    // nuevos se vean de inmediato.
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(indexHtml);
    });
    console.log("Serving static build from dist/ (PROD mode).");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} (${process.env.NODE_ENV === "production" ? "PROD" : "DEV"}, Wompi ${WOMPI_ENV}, Firestore ${useAdmin ? "admin" : "client"})`);
  });

  // Apagado ordenado: PM2 envía SIGINT/SIGTERM en cada redeploy/reload.
  // Cerrar el servidor con gracia evita peticiones cortadas (p. ej. un
  // webhook de Wompi a medio procesar).
  const shutdown = (signal: string) => {
    console.log(`${signal} recibido — cerrando servidor con gracia...`);
    server.close(() => {
      console.log("Servidor cerrado. Saliendo.");
      process.exit(0);
    });
    // Salvavidas: forzar salida si algo se cuelga.
    setTimeout(() => process.exit(0), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
