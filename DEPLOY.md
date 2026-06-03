# Despliegue en producción — Fly and Chill (AWS EC2)

Sitio en producción: **https://flyandchill.store**

## Arquitectura

```
Internet ──► nginx (80/443, TLS) ──► Express + tsx (127.0.0.1:3000) ──► Firestore / Wompi / Resend
                                         (gestionado por PM2)
```

- **Una sola instancia EC2** (Amazon Linux 2023, ~1 GB RAM). Monolito: el mismo
  proceso sirve la API (`/api/*`) y el frontend estático compilado (`dist/`).
- Sin microservicios con cobro por invocación → coste prácticamente fijo (solo el EC2).
- Wompi se integra vía **Web Checkout** (redirect) + **webhook** de eventos.

## ⚠️ Lo más importante: correr en modo PRODUCCIÓN

El servidor decide su comportamiento según `NODE_ENV`:

- `NODE_ENV=production` → sirve `dist/` (estático, ligero). **NO** carga Vite/HMR.
- sin esa variable → arranca el **servidor de desarrollo de Vite** (transpila al
  vuelo, vigila archivos, abre el websocket de HMR en el puerto `24678`). Esto
  consume cientos de MB de RAM y **no debe usarse en producción**.

> Si en `ss -tlnp` ves el puerto **24678** escuchando, el server está en modo DEV.
> En producción ese puerto NO debe existir.

## ⚠️ Paso 0 (una sola vez): crear swap

La instancia es **t3.micro: 1 GB de RAM y 0 swap**. El build del frontend
(esbuild + rollup, ~2.100 módulos) puede agotar la RAM y ser **abortado por el
kernel (OOM)**, dejando el despliegue a medias. Crear 2 GB de swap lo evita y es
gratis (usa el disco). Hay un script que lo hace; ejecutar **una sola vez**:

```bash
cd ~/origin
./scripts/setup-swap.sh
free -h   # debe mostrar Swap: 2.0Gi
```

Equivalente manual:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # persiste tras reinicio
```

> Alternativa sin swap: construir el frontend en tu PC (`npm run build`) y subir
> la carpeta `dist/` a la instancia. Pero lo recomendado es el swap + build en el
> servidor (más simple y reproducible).

## Despliegue en UN comando (recomendado)

Una vez creado el swap (paso 0) y con el `.env` configurado, cada redeploy es:

```bash
cd ~/origin
./deploy.sh
```

`deploy.sh` encadena: `git pull` → `npm ci` → `npm run build` → `pm2 reload` →
verificación de `/api/health` y de que NO esté el puerto HMR 24678. Si algo
falla, se detiene con un error claro (no deja el sitio a medio desplegar).

> Primera vez en una instancia recién creada:
> ```bash
> ./scripts/setup-swap.sh    # crea 2 GB de swap (una sola vez)
> pm2 start ecosystem.config.cjs && pm2 save
> ```
> `deploy.sh` ya detecta si el proceso existe y usa `reload` o `start` según corresponda.

## Pasos de despliegue manuales (equivalente, por si prefieres a mano)

```bash
cd ~/origin

# 1) Traer el código
git pull

# 2) Dependencias reproducibles
npm ci

# 3) Compilar el frontend (genera dist/)
npm run build

# 4) (Re)arrancar con PM2 en modo producción
pm2 reload ecosystem.config.cjs   # primera vez: pm2 start ecosystem.config.cjs
pm2 save                          # persistir entre reinicios del SO

# 5) Verificar
curl -s http://localhost:3000/api/health        # -> {"status":"ok", ...}
ss -tlnp | grep 24678 || echo "OK: sin HMR (modo prod)"
pm2 logs flyandchill --lines 30
```

`ecosystem.config.cjs` ya fija `NODE_ENV=production`, `PORT=3000` y un límite de
memoria (`max_memory_restart: 400M`) para que PM2 reinicie el proceso antes de
que el kernel lo mate por falta de RAM.

## Variables de entorno (archivo `~/origin/.env`, NO se sube a git)

```ini
# Wompi (producción)
WOMPI_PUBLIC_KEY=pub_prod_...
WOMPI_PRIVATE_KEY=prv_prod_...
WOMPI_EVENTS_SECRET=prod_events_...
WOMPI_INTEGRITY_SECRET=prod_integrity_...
WOMPI_ENV=production

# Dominio público (para el redirect-url de Wompi). SIN slash final.
PUBLIC_BASE_URL=https://flyandchill.store

# Puerto interno (nginx hace proxy a este)
PORT=3000

# Resend / SMTP  (sin SMTP_PASS NO se envían correos)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_...    # API key de Resend
SMTP_FROM_VENTAS="Fly and Chill <ventas@flyandchill.store>"
SMTP_FROM_NEWSLETTER="Fly and Chill <newsletter@flyandchill.store>"
```

## Firestore: permisos de escritura de pedidos

El backend escribe pedidos en Firestore. Hay dos formas de permitirlo (elige UNA):

**A) Desplegar las reglas (opción elegida).** Desde tu máquina, con Firebase CLI:

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules   # usa firebase.json (database ai-studio-...)
```

Las reglas en `firestore.rules` ya aceptan los campos del pedido
(`serial`, `reference`, `paymentStatus`, `billingInfo`, …) y la actualización
del estado de pago por el webhook. **Sin esto, crear un pedido da
"Hubo un error al procesar tu pedido" (PERMISSION_DENIED).**

**B) (Alternativa, más robusta) Cuenta de servicio.** Pon el JSON de una cuenta
de servicio de Firebase en la variable `FIREBASE_SERVICE_ACCOUNT` (una sola línea)
o como archivo `service-account.json` en la raíz. Así el backend usa el Admin SDK
y **no depende de las reglas**. `/api/health` mostrará `"firestore":"admin"`.

## Webhook de Wompi

En el panel de Wompi, configurar la URL de eventos:

```
https://flyandchill.store/api/wompi/webhook
```

El servidor verifica el `checksum` de cada evento con `WOMPI_EVENTS_SECRET`
antes de actualizar el pedido. En estado `APPROVED` envía el correo de
confirmación (idempotente: solo una vez por pedido).

## Feed de Instagram (página de Comunidad) — GRATIS

La sección "Cultura Digital" muestra las publicaciones de **@flyand_chill** y se
actualiza sola. Usa la **Graph API oficial de Instagram** (gratuita). Mientras no
haya token, la web muestra un fallback elegante "Síguenos en Instagram" (no se
rompe). Para activarlo, generar un token long-lived (una vez) y ponerlo en el
`.env` como `INSTAGRAM_ACCESS_TOKEN`. El servidor lo **auto-renueva** cada 60 días.

**Cómo generar el token (Instagram API with Instagram Login, sin Facebook):**

1. La cuenta **@flyand_chill** debe ser **Profesional** (Business o Creator):
   en la app de Instagram → Configuración → Tipo de cuenta → cambiar a profesional.
2. Ir a **developers.facebook.com** → crear una app de tipo **"Consumer"** o
   **"Business"** → añadir el producto **"Instagram"** (Instagram API Setup with
   Instagram login / Instagram Basic Display).
3. Generar un **token de acceso** para la cuenta y autorizarla.
4. Convertir el token corto en uno **long-lived** (60 días) con:
   ```
   curl -s "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=APP_SECRET&access_token=TOKEN_CORTO"
   ```
5. Poner el token resultante en el `.env` de la instancia:
   ```ini
   INSTAGRAM_ACCESS_TOKEN="IGQVJ...eltokenlargo..."
   ```
6. `./deploy.sh` (o reiniciar PM2). Verificar:
   ```
   curl https://flyandchill.store/api/instagram/feed
   ```
   Debe devolver `{"configured":true,"posts":[...]}`.

> El feed se cachea 30 min en el servidor para no exceder límites de la API.
> Cada publicación nueva en Instagram aparecerá arriba automáticamente.

## Comprobación post-despliegue (checklist)

1. `curl https://flyandchill.store/api/health` → `{"status":"ok",...}`.
2. `ss -tlnp` en la instancia → **sin** puerto `24678`.
3. `free -h` → uso de RAM del proceso mucho menor que en modo dev.
4. Compra de prueba real → redirige a Wompi → vuelve a `/checkout/confirmation`.
5. Pago aprobado → llega el correo de Resend con el botón de WhatsApp.
6. `pm2 logs flyandchill` sin errores de `PERMISSION_DENIED`.
