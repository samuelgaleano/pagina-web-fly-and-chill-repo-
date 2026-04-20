import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import fs from "fs";
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
      const smtpPort = Number(process.env.SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.resend.com",
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER || "resend",
          pass: process.env.SMTP_PASS,
        },
      });

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

  // Order Creation API
  app.post("/api/orders/create", async (req, res) => {
    const { orderData } = req.body;

    if (!orderData || !orderData.shippingInfo || !orderData.shippingInfo.email) {
      return res.status(400).json({ error: "Order data and customer email are required" });
    }

    try {
      // 1. Save to Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: jsServerTimestamp(),
        status: "pending"
      });

      const orderId = orderRef.id;
      const { shippingInfo, items, total, paymentMethod, promoCode } = orderData;

      // 1.5 Update promo code usage count if applicable
      if (promoCode) {
        try {
          const promoRef = collection(db, "promoCodes");
          const q = query(promoRef, where("code", "==", promoCode), jsLimit(1));
          const promoQuery = await getDocs(q);
          if (!promoQuery.empty) {
            const promoDoc = promoQuery.docs[0];
            await updateJSDoc(promoDoc.ref, {
              usageCount: jsIncrement(1)
            });
            console.log(`Usage count incremented for promo code: ${promoCode}`);
          }
        } catch (promoErr: any) {
          console.error("Error updating promo code usage:", promoErr.message || promoErr);
          // Don't fail the whole order if just the promo increment fails
        }
      }

      // 2. Send Order Summary Email
      const smtpPort = Number(process.env.SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.resend.com",
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: process.env.SMTP_USER || "resend",
          pass: process.env.SMTP_PASS,
        },
      });

      const fromEmail = process.env.SMTP_FROM_VENTAS || '"Fly and Chill" <ventas@flyandchill.store>';
      
      let paymentInstructions = "";
      const displayOrderId = orderId.substring(0, 6).toUpperCase();

      if (paymentMethod === "nequi") {
        paymentInstructions = `
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; border: 1px solid #76bbca; margin: 20px 0;">
            <h3 style="color: #76bbca; margin-top: 0;">📲 Instrucciones de Pago (Brev-B)</h3>
            <p>Por favor realiza la transferencia del total a la siguiente cuenta:</p>
            <p style="font-size: 24px; font-weight: 900; color: #333; margin: 10px 0;">Brev-B: @SAG296</p>
            <div style="text-align: center; margin-top: 20px;">
              <p style="font-size: 18px; color: #333; font-weight: bold;">
                Una vez realizado el pago, envía el comprobante a nuestro WhatsApp:
              </p>
              <a href="https://api.whatsapp.com/send?phone=573019202618&text=Hola!%20Adjunto%20comprobante%20de%20pago%20para%20el%20pedido%20%23FC-${displayOrderId}" 
                 style="display: inline-block; background-color: #25D366; color: white; padding: 15px 25px; border-radius: 50px; font-weight: 900; text-decoration: none; font-size: 20px; margin: 10px 0;">
                ENVIAR COMPROBANTE WHATSAPP
              </a>
              <p style="font-size: 22px; font-weight: 900; color: #25D366; display: block; margin-top: 10px;">+57 301 920 2618</p>
            </div>
            <p style="text-align: center; font-size: 14px; color: #666; margin-top: 15px;">O responde a este correo con la captura del pago.</p>
          </div>
        `;
      } else {
        paymentInstructions = `
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; border: 1px solid #76bbca; margin: 20px 0;">
            <h3 style="color: #76bbca; margin-top: 0;">💳 Pago con PSE/ Tarjeta Crédito - Débito</h3>
            <p>Has seleccionado pago con PSE o Tarjetas. Un administrador generará tu link de pago y te lo enviará en breve por este medio o vía WhatsApp.</p>
            <p style="font-size: 14px; color: #666;">Estamos preparando tu orden. Pronto recibirás el link oficial para completar la transacción.</p>
          </div>
        `;
      }

      const itemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString()}</td>
        </tr>
      `).join("");

      const isBogota = shippingInfo.city.toLowerCase().trim() === "bogota" || shippingInfo.city.toLowerCase().trim() === "bogotá";
      const shippingCost = isBogota ? 10000 : 15000;
      const subscriptionFee = 5000;
      const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

      const mailOptions = {
        from: fromEmail,
        to: shippingInfo.email,
        subject: `Resumen de tu pedido #FC-${displayOrderId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #76bbca;">¡Gracias por tu pedido, ${shippingInfo.firstName}! 🌿</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">Tu número de pedido es: <strong style="color: #76bbca;">#FC-${displayOrderId}</strong></p>
            <p>Hemos recibido tu pedido y estamos listos para procesarlo.</p>
            
            <h3 style="border-bottom: 2px solid #76bbca; padding-bottom: 5px;">Resumen del Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">Subtotal</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">Envío (${isBogota ? 'Bogotá' : 'Nacional'})</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${shippingCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                  Suscripción Fly Club<br/>
                  <small style="color: #888;">Autorización envío comunidad</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${subscriptionFee.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Total</td>
                <td style="padding: 10px; font-weight: bold; text-align: right; color: #76bbca; font-size: 20px;">$${total.toLocaleString()}</td>
              </tr>
            </table>

            ${paymentInstructions}

            <h3 style="border-bottom: 2px solid #76bbca; padding-bottom: 5px;">Datos de Envío</h3>
            <p style="margin: 5px 0;">${shippingInfo.firstName} ${shippingInfo.lastName}</p>
            <p style="margin: 5px 0;">${shippingInfo.address}</p>
            <p style="margin: 5px 0;">${shippingInfo.city}, ${shippingInfo.zipCode}</p>
            <p style="margin: 5px 0;">Tel: ${shippingInfo.phone}</p>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px; color: #888;">Si tienes alguna pregunta, no dudes en contactarnos.<br />El equipo de Fly and Chill</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions).then(info => {
        console.log("Order email sent to customer: %s", info.messageId);
      }).catch(err => {
        console.error("Error sending order email to customer:", err);
      });

      // 3. Notify Admin if it's a PCI/Card payment
      if (paymentMethod === "pse_card") {
        const adminEmails = ["samuel.galeano.alvis@gmail.com", "danysanty451@gmail.com"].join(", ");
        const adminMailOptions = {
          from: fromEmail,
          to: adminEmails,
          subject: `⚠️ ACCIÓN REQUERIDA: Generar Link de Pago - Pedido #FC-${orderId.substring(0, 6).toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f00; border-radius: 10px;">
              <h2 style="color: #d00;">Nuevo Pedido PSE / Tarjetas</h2>
              <p>Se requiere generar un link de pago manual para el siguiente cliente:</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #f00;">
                <p><strong>Cliente:</strong> ${shippingInfo.firstName} ${shippingInfo.lastName}</p>
                <p><strong>Email:</strong> ${shippingInfo.email}</p>
                <p><strong>Teléfono:</strong> ${shippingInfo.phone}</p>
                <p><strong>Monto Total:</strong> $${total.toLocaleString()}</p>
              </div>

              <h3>Detalle de Productos:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>

              <p style="margin-top: 20px;">Por favor genera el link y envíalo a: <strong>${shippingInfo.email}</strong></p>
              <hr />
              <p style="font-size: 12px; color: #666;">ID de Pedido: ${orderId}</p>
            </div>
          `
        };

        transporter.sendMail(adminMailOptions).then(info => {
          console.log("Admin notification email sent: %s", info.messageId);
        }).catch(err => {
          console.error("Error sending admin notification email:", err);
        });
      }

      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ error: "Hubo un error al procesar tu pedido." });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
