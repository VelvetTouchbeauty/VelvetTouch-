# VelvetTouch · tienda con pago automático

Qué hace: la clienta paga en la página (Wompi: tarjeta, Nequi, PSE, Botón Bancolombia) y, cuando el pago queda APROBADO, te llega un WhatsApp con el pedido, el cliente y la dirección.

Archivos: `index.html` (tienda) · `gracias.html` (resultado del pago) · `api/checkout.js` (crea el cobro) · `api/webhook.js` (recibe la confirmación de Wompi y te avisa) · `lib/` (precios y cálculos; el servidor recalcula todo, no confía en el navegador).

IMPORTANTE: este código se probó con pagos simulados, no con Wompi real. Haz primero TODAS las pruebas en modo sandbox.

## Paso 1 · Cuenta en Wompi
1. Crea tu cuenta en comercios.wompi.co (es de Bancolombia) y completa la verificación del comercio.
2. En Desarrolladores copia: llave pública (pub_test_...), secreto de integridad y secreto de eventos. Empieza con las llaves de PRUEBA.

## Paso 2 · Base de datos gratis (guarda el pedido hasta que se paga)
1. Crea una cuenta en upstash.com → Redis → Create database.
2. Copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.

## Paso 3 · Aviso a tu WhatsApp
Usamos CallMeBot (gratis, no oficial). Activa tu número 573186315735 siguiendo las instrucciones de https://www.callmebot.com/blog/free-api-whatsapp-messages/ y guarda el `apikey` que te dé. Si más adelante quieres el canal oficial, se cambia por la API de WhatsApp de Meta o Twilio (solo se edita `avisarWhatsApp` en `lib/shared.js`).

## Paso 4 · Subir el sitio (Vercel, gratis)
1. Crea un repositorio en github.com. GitHub solo deja subir 100 archivos por vez, y aquí hay más, así que súbelo en DOS pasos:
   a) Primero arrastra SOLO la carpeta `img` (89 fotos) y pulsa Commit changes.
   b) Luego arrastra el resto: `index.html`, `gracias.html`, `package.json`, la carpeta `api` y la carpeta `lib`. Si ya tenías un `index.html` viejo, se reemplaza.
2. En vercel.com → Add New Project → importa el repositorio. No cambies nada de la configuración.
3. En Settings → Environment Variables agrega las 8 variables de `.env.example` con tus valores reales. Para `SITE_URL` usa la dirección final (https://tudominio.co).
4. Deploy. Cada vez que cambies un archivo en GitHub, se actualiza solo.

## Paso 5 · Dirección propia
1. Compra el dominio (por ejemplo velvettouch.co) en Namecheap, GoDaddy, Hostinger o Cloudflare. Revisa que esté libre y su precio anual.
2. En Vercel → Settings → Domains → agrega el dominio y copia los registros DNS que te indica en el panel de tu proveedor. En minutos u horas queda con https.
3. Actualiza `SITE_URL` con ese dominio y vuelve a hacer Deploy.

### Vista previa al compartir el enlace (WhatsApp)
En `index.html` busca `https://TUDOMINIO.co/img/og.png` y cambia TUDOMINIO.co por tu dominio real. Si no lo cambias, todo funciona, pero el enlace compartido se verá sin imagen.

## Paso 6 · Conectar Wompi con tu sitio
En Wompi → Desarrolladores → URL de eventos, pon: `https://tudominio.co/api/webhook` (en sandbox y luego en producción).

## Paso 7 · Pruebas (sandbox)
1. En `gracias.html` cambia `WOMPI_API` por `https://sandbox.wompi.co/v1` mientras pruebas.
2. Haz un pedido y paga con los datos de prueba de la documentación de Wompi (docs.wompi.co). Debes ver: pantalla "¡Pago recibido!" y un WhatsApp con el pedido.
3. Prueba también un pago rechazado, y un pedido con BELLA10 y otro con 2x1 de skincare.

## Paso 8 · Pasar a producción
Cambia las 3 llaves de Wompi por las de producción (pub_prod_...), deja `WOMPI_API` en `https://production.wompi.co/v1`, haz Deploy y prueba con un pedido real de monto bajo.

## Para tener en cuenta
- Revisa en Wompi las comisiones por método de pago y los plazos en que te desembolsan.
- Si vendes con regularidad, consulta con un contador sobre facturación electrónica y obligaciones tributarias.
- Para cambiar un precio: edita `lib/catalog.json` (precio del servidor) Y la lista de productos en `index.html`; deben ser iguales. Si difieren, el cobro usa el de `catalog.json`.
- Addi sigue pendiente: tiene su propio acuerdo e integración.
- Los textos legales son un borrador; que los revise un abogado.
