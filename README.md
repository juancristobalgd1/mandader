# mandader

Tu súper a domicilio: buscas productos de supermercado, pagas y tu repartidor hace la compra y te la lleva a casa. Misma base y estilo que [pisder](https://github.com/juancristobalgd1/pisder).

Zona inicial: Elgoibar, Eibar, Deba, Soraluze, Mutriku y Mendaro (cámbiala en `lib/pricing.ts`).

## Qué incluye
- **Portada** con buscador en lenguaje natural («leche sin lactosa», «detergente hasta 6 €», «aceite de oliva barato») y pasillos: frescos, lácteos, despensa, panadería, bebidas, congelados, limpieza, higiene, bebé y mascotas.
- **Buscar** `/buscar`, **tienda** `/tienda/[id]`, **producto** `/producto/[id]` con foto, marca y precio.
- **Carrito y pago** `/carrito`, `/pagar`: envío, gratis desde 40 €, pedido mínimo, aviso +18 para alcohol, notas para pedir lo que no esté.
- **Seguimiento** `/pedido?id=…` y **panel de repartidor** `/repartidor`.
- **Servidor** `server/index.ts`: cobro con Stripe Checkout (precios siempre del catálogo del servidor), webhook firmado, pedidos y aviso por Telegram.

Sin `NEXT_PUBLIC_API_URL` la web funciona en modo demo (pago simulado).

## Catálogo real de supermercado
`npm run ingest -- 650` regenera `data/catalog.json` leyendo fichas públicas de producto (nombre, marca, precio, foto, pasillo) de los supermercados que lo permiten. El importador respeta `robots.txt`, se identifica como `mandader-bot` y hace como mucho una petición por segundo.

Revisión del 5 de octubre de 2026:

| Súper | ¿Se puede? | Motivo |
|---|---|---|
| Ahorramas | Sí (incluido) | robots.txt permite las fichas y su aviso legal no prohíbe la extracción |
| Mercadona | No | robots.txt bloquea `/api` y casi toda la tienda |
| Eroski, BM | No | la tienda online exige captcha a los robots |
| Dia | No | su aviso legal limita el uso a «estrictamente privado» |
| Alcampo | No | su aviso legal reserva la reproducción del contenido |
| Consum | No | robots.txt bloquea `/api` y la web no publica los datos en las fichas |

Para Eroski, BM, Mercadona o Dia (los que hay en la zona) la vía es un acuerdo con la tienda o su feed de producto. Los precios son de referencia online y pueden variar en tienda. Las fotos se muestran enlazadas desde la web del súper.

## Arrancar
```bash
npm install
npm run dev
npm test
npm run build
```

## Cobro real
1. Copia `server/.env.example` a `server/.env` y rellena Stripe, `RIDER_TOKEN` y (opcional) Telegram.
2. `npm run api` en tu servidor (hay `server/mandader-api.service`) detrás de HTTPS.
3. Webhook de Stripe a `https://TU-API/api/stripe/webhook`, evento `checkout.session.completed`.
4. En GitHub → Settings → Variables: `API_URL=https://TU-API`.
