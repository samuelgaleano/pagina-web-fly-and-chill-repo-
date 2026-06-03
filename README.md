<div align="center">
  <h1>🌿 Fly and Chill — Tienda E-commerce</h1>
  <p><strong>Comercio electrónico de productos con pasarela de pagos Wompi (Colombia)</strong></p>
  <p>Producción: <a href="https://flyandchill.store">https://flyandchill.store</a></p>
</div>

---

## 📑 Tabla de contenido

1. [¿Qué es esto?](#-qué-es-esto)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Arquitectura general](#-arquitectura-general)
4. [Estructura de carpetas](#-estructura-de-carpetas)
5. [El flujo de compra paso a paso](#-el-flujo-de-compra-paso-a-paso)
6. [Integración con Wompi (pagos)](#-integración-con-wompi-pagos)
7. [Base de datos (Firebase/Firestore)](#-base-de-datos-firebasefirestore)
8. [Correos (Resend)](#-correos-resend)
9. [Variables de entorno](#-variables-de-entorno)
10. [Cómo correr el proyecto localmente](#-cómo-correr-el-proyecto-localmente)
11. [Cómo desplegar a producción (AWS)](#-cómo-desplegar-a-producción-aws)
12. [Cómo editar y publicar cambios](#-cómo-editar-y-publicar-cambios)
13. [Decisiones de UX y conversión](#-decisiones-de-ux-y-conversión)
14. [Costos](#-costos)
15. [Preguntas frecuentes / Solución de problemas](#-preguntas-frecuentes--solución-de-problemas)
16. [Otros documentos](#-otros-documentos)

---

## 🌿 ¿Qué es esto?

Fly and Chill es una **tienda en línea** (una sola página de aplicación, SPA) donde los
clientes navegan un catálogo de productos, los agregan a un carrito y pagan con
**Wompi** (la pasarela de pagos colombiana: tarjeta, PSE, Nequi, Bancolombia).

El proyecto es **full-stack en un solo repositorio**:
- **Frontend:** React + Vite (la interfaz que ve el cliente).
- **Backend:** un servidor Express (Node.js) que crea los pedidos, firma las
  transacciones de Wompi, recibe las confirmaciones de pago (webhook) y envía
  correos.
- **Base de datos:** Firebase Firestore (guarda productos, pedidos, leads, promos).

Todo corre junto en **una sola instancia de AWS EC2**, detrás de **nginx**, gestionado
por **PM2**.

---

## 🧱 Stack tecnológico

| Capa | Tecnología | Para qué |
|------|-----------|----------|
| UI | **React 19** + **TypeScript** | Componentes de la interfaz |
| Build / dev | **Vite 6** | Compilar y servir el frontend |
| Estilos | **Tailwind CSS 4** | Diseño y responsive |
| Animaciones | **Motion** (framer-motion) | Transiciones suaves |
| Routing | **React Router 7** | Navegación entre páginas (SPA) |
| Iconos | **lucide-react** | Iconografía |
| Backend | **Express 4** (vía `tsx`) | API + servir el frontend |
| Base de datos | **Firebase Firestore** | Persistencia |
| Auth (admin) | **Firebase Auth** (Google) | Login del panel de administración |
| Pagos | **Wompi** (Web Checkout + Widget) | Cobrar a los clientes |
| Correos | **Resend** (SMTP) | Confirmaciones y newsletter |
| Proceso | **PM2** | Mantener el servidor vivo |
| Servidor web | **nginx** | Proxy inverso + TLS |
| Infra | **AWS EC2** (Amazon Linux 2023) | Hosting |

---

## 🏗️ Arquitectura general

```
                         Internet
                            │
                            ▼
              ┌───────────────────────────┐
              │   nginx  (puertos 80/443) │   TLS / HTTPS
              └─────────────┬─────────────┘
                            │  proxy inverso
                            ▼
              ┌───────────────────────────┐
              │  Express + tsx  (:3000)   │   ← gestionado por PM2
              │                           │
              │  • Sirve el frontend      │
              │    (dist/ ya compilado)   │
              │  • API /api/*             │
              └───┬───────────┬───────────┘
                  │           │
        ┌─────────▼──┐   ┌────▼─────────┐   ┌──────────────┐
        │  Firestore │   │    Wompi     │   │    Resend    │
        │ (pedidos,  │   │  (pagos +    │   │  (correos)   │
        │  productos)│   │   webhook)   │   │              │
        └────────────┘   └──────────────┘   └──────────────┘
```

**Por qué un monolito y no microservicios:** para este volumen, un solo servidor
en un EC2 es lo más **simple, barato y mantenible**. No hay cobros por invocación
ni complejidad de orquestación. Es la arquitectura correcta aquí.

---

## 📂 Estructura de carpetas

```
pagina-web-fly-and-chill-repo-/
├── server.ts                 # ⭐ Backend: API, Wompi, webhook, correos
├── ecosystem.config.cjs      # Config de PM2 (modo producción, límite de RAM)
├── deploy.sh                 # ⭐ Despliegue en 1 comando (en la instancia)
├── scripts/
│   └── setup-swap.sh         # Crea swap en el EC2 (una vez)
├── index.html                # HTML raíz (carga el widget de Wompi)
├── vite.config.ts            # Config de Vite (chunks, alias @)
├── firebase.json             # Config para desplegar reglas de Firestore
├── firestore.rules           # ⭐ Reglas de seguridad de la base de datos
├── .firebaserc               # Proyecto Firebase por defecto
├── .env                      # ⚠️ Secretos (NO se sube a git)
├── service-account.json      # ⚠️ Cuenta de servicio Firebase (NO se sube a git)
│
├── src/
│   ├── main.tsx              # Punto de entrada de React
│   ├── components/
│   │   ├── App.tsx           # ⭐ Rutas (code-splitting por página)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx    # Barra superior + menú móvil + carrito
│   │   │   └── Footer.tsx
│   │   └── ui/               # Botones, modal de edad, WhatsApp, etc.
│   ├── context/
│   │   ├── CartContext.tsx   # ⭐ Estado del carrito (localStorage)
│   │   └── ShopContext.tsx   # ⭐ Productos (Firestore, cache-first) + auth
│   ├── pages/
│   │   ├── Home.tsx          # Página de inicio (hero + destacados)
│   │   ├── Shop.tsx          # ⭐ Catálogo con filtros
│   │   ├── ProductDetail.tsx # ⭐ Ficha de producto (Comprar / Agregar)
│   │   ├── Cart.tsx          # Carrito
│   │   ├── Checkout.tsx      # ⭐ Datos de envío + pago (abre Wompi)
│   │   ├── CheckoutConfirmation.tsx  # ⭐ Resultado del pago
│   │   ├── Community.tsx / About.tsx / Contact.tsx
│   │   └── Admin.tsx         # Panel de administración (productos/pedidos)
│   ├── lib/
│   │   ├── firebase.ts       # Inicialización de Firebase (cliente)
│   │   └── formatters.ts     # formatPrice, etc.
│   ├── data/
│   │   └── products.ts       # Productos de respaldo (si Firestore falla)
│   └── types.ts              # Tipos TypeScript (Product, Order, etc.)
│
├── DEPLOY.md                 # Guía de despliegue detallada
├── ARQUITECTURA-Y-COSTOS.md  # Evaluación de arquitectura y costos
└── README.md                 # Este archivo
```

> ⭐ = archivos más importantes para entender el proyecto.

---

## 🛒 El flujo de compra paso a paso

1. **El cliente entra** a `flyandchill.store` → ve el **Home** con un botón grande
   "COMPRAR BEST SELLER" (lleva al primer producto real) y "Ver Catálogo".
2. **Navega el catálogo** (`/shop`) → filtra por categoría/sabor/precio. En móvil
   los filtros están en un cajón colapsable para ver productos al instante.
3. **Agrega productos** al carrito — con el botón "Agregar" (siempre visible) o
   entrando a la ficha del producto.
4. En la **ficha de producto** (`/shop/:id`) puede:
   - **COMPRAR AHORA** → va directo al checkout (camino más corto).
   - **Añadir al carrito** → sigue navegando.
   - En móvil hay una **barra fija inferior** con el precio y "Comprar ahora".
5. En el **Checkout** (`/checkout`) llena sus **datos de envío** y elige
   **método de pago**. El resumen del pedido lo acompaña al hacer scroll.
6. Al dar **PAGAR AHORA**:
   - El frontend llama a `POST /api/orders/create`.
   - El backend crea el pedido en Firestore (estado `pending`), calcula la
     **firma de integridad** de Wompi y devuelve los datos.
   - Se abre el **Widget de Wompi SOBRE la misma página** (no redirige) con los
     datos del cliente ya cargados.
7. El cliente paga dentro del widget. Al terminar, el callback lo lleva a
   **`/checkout/confirmation?id=<transacción>`**.
8. La página de confirmación **consulta el estado real** del pago a Wompi
   (`GET /api/wompi/transaction/:id`) y muestra: ✅ aprobado / ❌ rechazado /
   ⏳ pendiente. En aprobado, ofrece un botón de **WhatsApp** para consultar el
   pedido.
9. **En paralelo**, Wompi envía un **webhook** a `POST /api/wompi/webhook`. El
   backend verifica la firma del evento, marca el pedido como `paid` y **envía el
   correo de confirmación** (al cliente y al admin) — una sola vez (idempotente).

---

## 💳 Integración con Wompi (pagos)

### Conceptos clave

- **Llave pública** (`pub_prod_…`): se puede exponer al navegador.
- **Llave privada / secretos** (`prv_prod_…`, `prod_events_…`, `prod_integrity_…`):
  **NUNCA** llegan al navegador. Viven solo en el backend (`.env`).
- **Firma de integridad:** un hash `SHA256(referencia + montoEnCentavos + "COP" +
  secretoIntegridad)` que el backend calcula para que Wompi acepte la transacción.
  Se genera en `server.ts` → `buildIntegritySignature()`.
- **Widget embebido:** la pasarela se abre como un modal sobre la página usando
  `window.WidgetCheckout` (el script se carga en `index.html`). Antes redirigía a
  `checkout.wompi.co`; ahora el cliente no sale del sitio.

### Endpoints del backend (en `server.ts`)

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/orders/create` | Crea el pedido (pending) y devuelve la firma + datos para el widget |
| `GET` | `/api/wompi/transaction/:id` | Consulta el estado de una transacción y reconcilia el pedido |
| `GET` | `/api/wompi/config` | Devuelve la llave pública (no secreta) al frontend |
| `POST` | `/api/wompi/webhook` | Recibe eventos de Wompi, verifica firma, marca pagado y envía correo |
| `GET` | `/api/orders/by-reference/:ref` | Busca un pedido por su serial |
| `POST` | `/api/newsletter/signup` | Registra un correo en la lista y manda el de bienvenida |
| `GET` | `/api/health` | Estado del servidor + modo de Firestore (admin/client) |

### Configuración en el panel de Wompi

En **Wompi → Desarrollo: Programadores → URL de Eventos**, registrar:

```
https://flyandchill.store/api/wompi/webhook
```

Sin esto, el pago funciona pero **el correo automático no se dispara** (la página
de confirmación igual muestra el resultado consultando el estado).

---

## 🔥 Base de datos (Firebase/Firestore)

### Dos formas de acceder (el backend elige automáticamente)

1. **Admin SDK (recomendado, el que usa producción):** si existe
   `service-account.json` (o la variable `FIREBASE_SERVICE_ACCOUNT`), el backend
   usa una **cuenta de servicio** que **ignora las reglas de seguridad**. Esto es
   lo correcto para un backend de pagos: puede leer/actualizar pedidos y disparar
   correos sin restricciones. `/api/health` muestra `"firestore":"admin"`.

2. **SDK cliente (respaldo):** si no hay cuenta de servicio, el backend usa el SDK
   del navegador, **sujeto a las reglas** de `firestore.rules`. En este modo puede
   **crear** pedidos (las reglas lo permiten de forma anónima) pero **no** puede
   actualizarlos ni leerlos → el webhook y los correos fallan. `/api/health`
   muestra `"firestore":"client"`.

> ⚠️ **Importante:** producción debe estar en modo **admin**. Si ves `"client"`,
> falta el `service-account.json` en la instancia.

### Colecciones

| Colección | Contenido |
|-----------|-----------|
| `products` | Catálogo (nombre, precio, imágenes, stock, categoría, sabores) |
| `orders` | Pedidos (items, total, datos de envío, estado de pago, serial) |
| `leads` | Correos del newsletter |
| `promoCodes` | Códigos de descuento (ej. `BIENVENIDO10`) |

### Reglas de seguridad (`firestore.rules`)

- Cualquiera puede **leer productos** y **crear un pedido anónimo** (necesario para
  el checkout).
- Solo el **admin** (correos autorizados) puede editar productos o leer todos los
  pedidos.
- El webhook actualiza el estado de pago a través del Admin SDK (que ignora reglas).

Para desplegar las reglas (desde tu PC, con Firebase CLI):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## 📧 Correos (Resend)

Se usan SMTP de **Resend**. Hay dos remitentes:
- `ventas@flyandchill.store` → confirmaciones de pedido.
- `newsletter@flyandchill.store` → bienvenida del newsletter.

El correo de confirmación se envía **solo cuando el pago es aprobado** (desde el
webhook), con el resumen del pedido y un botón de WhatsApp. Es **idempotente**:
nunca se envía dos veces para el mismo pedido (bandera `emailSent`).

> Requiere `SMTP_PASS` (la API key de Resend, `re_…`) en el `.env`. Sin ella, no
> salen correos.

---

## 🔑 Variables de entorno

Se configuran en un archivo **`.env`** en la raíz (en la instancia de producción).
**Este archivo NO se sube a git** (está en `.gitignore`). Plantilla en `.env.example`.

```ini
# ===== Wompi (producción) =====
WOMPI_PUBLIC_KEY=pub_prod_xxx          # pública (se expone al frontend)
WOMPI_PRIVATE_KEY=prv_prod_xxx         # SECRETO
WOMPI_EVENTS_SECRET=prod_events_xxx    # SECRETO (verifica el webhook)
WOMPI_INTEGRITY_SECRET=prod_integrity_xxx  # SECRETO (firma transacciones)
WOMPI_ENV=production
VITE_WOMPI_PUBLIC_KEY=pub_prod_xxx     # copia pública para el frontend

# ===== Sitio =====
PUBLIC_BASE_URL=https://flyandchill.store   # para el redirect de Wompi
PORT=3000                                    # puerto interno (nginx hace proxy)

# ===== Firebase Admin (recomendado) =====
# Alternativa a service-account.json. JSON en una sola línea.
FIREBASE_SERVICE_ACCOUNT=

# ===== Correo (Resend) =====
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxx                       # SECRETO (API key de Resend)
SMTP_FROM_VENTAS="Fly and Chill <ventas@flyandchill.store>"
SMTP_FROM_NEWSLETTER="Fly and Chill <newsletter@flyandchill.store>"
```

> 🔐 **Los secretos viven en dos archivos que nunca se suben a git:** `.env`
> (claves Wompi/SMTP) y `service-account.json` (cuenta de servicio Firebase).
> Si recreas la instancia, debes volver a crearlos.

---

## 💻 Cómo correr el proyecto localmente

**Requisitos:** Node.js 20+ (en producción se usa 24).

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env (copia .env.example y rellena los valores)
cp .env.example .env

# 3. Arrancar en modo desarrollo (Vite con hot-reload)
npm run dev
# → abre http://localhost:3000
```

Scripts disponibles (`package.json`):

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Servidor de desarrollo (Vite + Express, hot-reload) |
| `npm run build` | Compila el frontend a `dist/` |
| `npm start` | Arranca el servidor (usa `NODE_ENV=production` para servir `dist/`) |
| `npm run lint` | Chequeo de tipos con TypeScript |

---

## 🚀 Cómo desplegar a producción (AWS)

> Guía detallada en **[DEPLOY.md](DEPLOY.md)**. Resumen:

La instancia EC2 tiene el repo clonado en `~/origin`. El despliegue es **un solo
comando**:

```bash
# Conéctate por SSH a la instancia, luego:
cd ~/origin
./deploy.sh
```

`deploy.sh` hace automáticamente: `git pull` → `npm ci` → `npm run build` →
reinicia con PM2 en modo producción → verifica que `/api/health` responde y que
no quedó el modo desarrollo.

**Primera vez en una instancia nueva** (una sola vez):

```bash
./scripts/setup-swap.sh                 # crea 2 GB de swap (evita que el build muera por RAM)
nano .env                               # crear el .env con los secretos
nano service-account.json               # pegar la cuenta de servicio de Firebase
pm2 start ecosystem.config.cjs && pm2 save
```

---

## ✏️ Cómo editar y publicar cambios

El flujo recomendado (rama + Pull Request):

```bash
# 1. En tu PC, parado en main y al día
git checkout main
git pull origin main

# 2. Crear una rama para tu cambio
git checkout -b mi-cambio

# 3. ...editar archivos...

# 4. Revisar, agregar y commitear
git status
git add -A
git commit -m "descripción del cambio"

# 5. Subir y abrir el PR
git push -u origin mi-cambio
# (GitHub muestra un enlace para crear el Pull Request)
```

Una vez el PR está en `main`, **desplegar en la instancia**:

```bash
cd ~/origin && ./deploy.sh
```

> El `.env` y `service-account.json` de la instancia **no se tocan** en un
> `git pull` (están ignorados), así que tus secretos están a salvo en cada deploy.

---

## 🎯 Decisiones de UX y conversión

La página está optimizada para **vender desde móvil** (canal principal). Decisiones
clave:

- **Mínimos clics para comprar:** desde una ficha de producto, "COMPRAR AHORA"
  lleva en **un solo toque** al checkout. Hay una barra de compra fija en móvil.
- **Productos primero:** el Home dirige al catálogo con CTAs claros; en el catálogo
  móvil los filtros están colapsados para no tapar los productos.
- **Botón "Agregar" siempre visible** en las tarjetas (en móvil no existe el
  hover, así que un botón oculto tras hover = botón invisible).
- **Pasarela sin salir del sitio:** el widget de Wompi se abre sobre la página,
  reduciendo el abandono que produce una redirección externa.
- **Confianza:** sellos de "Pago seguro procesado por Wompi", verificación de
  edad, y botón de WhatsApp para atención directa.

---

## 💰 Costos

> Detalle en **[ARQUITECTURA-Y-COSTOS.md](ARQUITECTURA-Y-COSTOS.md)**.

- **EC2 `t3.micro`:** dentro de la **capa gratuita de AWS** (12 meses) → ~$0.
- **Firestore / Auth:** plan gratuito de Firebase cubre el volumen actual.
- **Resend:** gratis hasta 3.000 correos/mes.
- **Wompi:** cobra una comisión por transacción (no es costo de infraestructura).

El backend está optimizado para gastar lo mínimo: sirve archivos estáticos en
producción (no carga Vite), usa lectura con caché para los productos (menos
lecturas facturables de Firestore) y PM2 reinicia si la RAM se acerca al límite.

---

## ❓ Preguntas frecuentes / Solución de problemas

**"Hubo un error al procesar tu pedido" al pagar.**
El backend no puede escribir en Firestore. Causa típica: está en modo `client` sin
cuenta de servicio, o no se desplegaron las reglas. Verifica
`curl https://flyandchill.store/api/health` → debe decir `"firestore":"admin"`. Si
dice `"client"`, falta `service-account.json` en la instancia.

**El pago se hace pero no llega el correo.**
Falta registrar la **URL del webhook** en el panel de Wompi, o falta `SMTP_PASS` en
el `.env`. Revisa `pm2 logs flyandchill`.

**El build muere en la instancia (`Killed`).**
Falta de RAM en el t3.micro. Corre `./scripts/setup-swap.sh` una vez.

**Después de desplegar veo el puerto 24678 abierto (`ss -tlnp`).**
El servidor arrancó en modo desarrollo. Asegúrate de usar `./deploy.sh` /
`ecosystem.config.cjs` (que fija `NODE_ENV=production`), no `tsx server.ts` a pelo.

**¿Cómo agrego o edito productos?**
Desde el panel de **Admin** (`/admin`), iniciando sesión con un correo autorizado.
Los productos se guardan en Firestore.

---

## 📚 Otros documentos

- **[DEPLOY.md](DEPLOY.md)** — guía de despliegue detallada para la instancia EC2.
- **[ARQUITECTURA-Y-COSTOS.md](ARQUITECTURA-Y-COSTOS.md)** — evaluación de
  arquitectura y plan para mantener el costo cercano a $0.
- **[.env.example](.env.example)** — plantilla de variables de entorno.

---

<div align="center">
  <sub>Fly and Chill · Tienda construida con React, Express, Firebase y Wompi.</sub>
</div>
