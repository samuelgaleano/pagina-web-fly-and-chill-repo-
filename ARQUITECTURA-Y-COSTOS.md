# Evaluación de arquitectura y costos — Fly and Chill

> Objetivo: la mejor estructura con buenas prácticas y el **menor costo posible**
> (idealmente cercano a $0). Documento basado en el estado real del proyecto y
> de la instancia de producción.

## 1. Mapa actual de servicios

| Capa | Servicio | Uso real | Modelo de costo |
|------|----------|----------|-----------------|
| Cómputo | **AWS EC2 `t3.micro`** (2 vCPU, 1 GB RAM, disco EBS 8 GB), us-east-2 | Express + frontend, vía PM2 detrás de nginx | **Fijo por hora**, pero hoy cubierto por la **capa gratuita** (12 meses, 750 h/mes de t3.micro) → ~$0 |
| Frontend | Servido por el mismo Express (`dist/`) | SPA React | Incluido en el EC2 |
| Base de datos | **Firebase Firestore** | productos, pedidos, leads, promos | **Por operación** (lecturas/escrituras/borrados) + almacenamiento |
| Auth | **Firebase Auth** (Google) | login de admin | **Gratis** hasta 50k MAU |
| Storage | **Firebase Storage** | (no se usa desde el cliente) | Por GB; hoy ~irrelevante |
| Correo | **Resend** | confirmación de compra, newsletter | Plan gratis: 3.000/mes, 100/día |
| Pagos | **Wompi** | pasarela | Comisión por transacción (no es infra) |
| DNS/Dominio | (donde tengas flyandchill.store) | — | Anual |

**Conclusión de arquitectura:** el monolito en un solo EC2 detrás de nginx es
**correcto y barato** para este volumen. No conviene partirlo en microservicios
con cobro por invocación: añadiría costo y complejidad sin beneficio aquí.

---

## 2. Lo que ya se optimizó en estas sesiones

### Cómputo (EC2 / AWS)
- **Producción ya no corre el servidor de desarrollo de Vite.** Antes el proceso
  cargaba Vite/esbuild/rollup en RAM (~330 MB en una caja de 1 GB, al borde de
  OOM) y transpilaba en cada request. Ahora sirve `dist/` estático.
- **PM2 con `max_memory_restart` y apagado ordenado** → estabilidad sin tocar el
  tamaño (ni el costo) de la instancia.
- **Cache HTTP**: `/assets` (con hash) inmutable 1 año; HTML `no-cache`. Menos
  ancho de banda servido.

### Frontend (peso que descarga el cliente)
- **Code-splitting por ruta** (`React.lazy`) + **vendor chunks**. El bundle pasó
  de **1 archivo de 1.055 kB** a chunks por página + vendors cacheables. La carga
  inicial es mucho más liviana.

### Firebase (costo por operación) — lo más importante para acercarse a $0
- **Eliminada** la lectura `testConnection()` que se ejecutaba en **cada carga de
  página de cada visitante** (lecturas facturables puras, sin valor).
- **Catálogo cache-first con TTL (1h)** en lugar de listener en tiempo real. Las
  visitas repetidas dentro de la ventana generan **0 lecturas**. El Admin
  mantiene tiempo real (lo usa una sola persona).
- **Quitada** la init de Firebase Storage (no se usaba).

---

## 3. Hacia costo casi $0 — recomendaciones priorizadas

### 🟢 Prioridad ALTA (mayor ahorro / esfuerzo razonable)

1. **Firestore: mantener el patrón cache-first.** Ya aplicado al catálogo. Regla
   general: ninguna lectura en bucle ni listener en páginas públicas. Esto es lo
   que más baja la factura de Firebase.

2. **EC2 — ya estás en el mínimo razonable (`t3.micro`) y en capa gratuita.**
   Estado real: instancia creada ~2026-05-08, dentro de los **12 meses de capa
   gratuita** (750 h/mes de `t3.micro` = una instancia encendida todo el mes).
   Con poco tráfico, tu cómputo hoy cuesta **~$0**. Acciones:
   - **No bajar de tamaño** (t3.micro ya es el piso práctico; 1 GB de RAM exige
     el swap del paso 0 de DEPLOY.md para construir sin OOM).
   - **Antes de que se cumplan los 12 meses**, decidir: comprar un **Savings
     Plan** (~30–40% off) para seguir en t3.micro barato, o mover el frontend a
     hosting estático gratis (ver punto 7) y mantener solo la API.
   - Poner una **alerta de AWS Budgets** para enterarte cuando termine la capa
     gratuita y la factura empiece a subir.

3. **Cloudflare (gratis) por delante del dominio.** Pon el dominio en Cloudflare
   (plan free) como CDN/proxy:
   - Cachea los estáticos en el borde → **menos tráfico y CPU al EC2**.
   - TLS gratis, protección básica de bots/DDoS.
   - No cambia tu arquitectura: nginx sigue igual detrás.

### 🟡 Prioridad MEDIA

4. **Firestore: índices y consultas acotadas.** En Admin, las consultas con
   `orderBy`/`onSnapshot` sobre `orders` deben paginar (`limit`) en vez de traer
   toda la colección, para que el costo no crezca con el número de pedidos.

5. **Resend dentro del plan gratis.** 3.000 correos/mes cubren un comercio
   pequeño. Vigilar el límite de **100/día**; si se supera, agrupar
   notificaciones de admin o subir de plan.

6. **Presupuestos y alertas de costo.** Activar **AWS Budgets** (alerta por
   correo al pasar de un umbral, p. ej. $5) y los **alertas de presupuesto de
   Google Cloud/Firebase**. Cuesta $0 y evita sorpresas.

### 🔵 Opcional / a futuro (evaluar solo si el tráfico crece)

7. **Migrar el frontend a un hosting estático gratis** (Cloudflare Pages,
   Firebase Hosting, o similar) y dejar el EC2 solo para la API. El frontend
   estático saldría **gratis** y el EC2 podría ser aún más pequeño. Es un cambio
   de despliegue, no de código (el build ya es estático).

8. **Imágenes optimizadas** (WebP/AVIF + tamaños responsivos). Reduce el mayor
   peso real de una tienda. Hoy el CSS/JS ya está controlado; las imágenes son
   el siguiente objetivo si se busca rendimiento.

---

## 4. Resumen de "mejor estructura óptima y de bajo costo"

- **Mantener** el monolito en 1 EC2 + nginx (simple y barato). No microservicios.
- **EC2** = único costo fijo → atacarlo con Savings Plan o bajando de tamaño, y
  descargarlo con **Cloudflare free** delante.
- **Firebase** = costo variable → patrón **cache-first**, sin lecturas inútiles,
  consultas paginadas. Es lo aplicado y lo que más acerca a $0.
- **Resend/Auth** ya están en capa gratuita.
- **Alertas de presupuesto** en AWS y Google Cloud para no llevarte sustos.

> Para afinar números reales necesitaría ver (capturas o datos): el **tamaño y
> tipo exacto del EC2** y su factura, el panel de **uso de Firestore**
> (lecturas/escrituras por día) y el **plan actual de Firebase** (Spark gratis o
> Blaze pago). Con eso puedo recomendar el tamaño de instancia y estimar el
> ahorro concreto.
