# mandader

App de mandados a domicilio: buscas cualquier producto (comida, súper, farmacia, pan, bebidas, cosas de casa), pagas y tu repartidor lo compra y te lo lleva a casa. Misma base y estilo que [pisder](https://github.com/juancristobalgd1/pisder), con su «modo flechazo»: aquí deslizas platos y productos y a la derecha van directos al carrito.

Zona inicial: Elgoibar, Eibar, Deba, Soraluze, Mutriku y Mendaro (cámbiala en `lib/pricing.ts`).

## Qué incluye
- **Portada** con buscador en lenguaje natural («pizza para cenar hasta 15 €», «leche sin lactosa», «algo vegano barato»), categorías, lo más pedido y tiendas.
- **Buscar** `/buscar`, **tienda** `/tienda/[id]`, **producto** `/producto/[id]`.
- **Modo flechazo** `/flechazo`: desliza; derecha = al carrito.
- **Carrito y pago** `/carrito`, `/pagar`: varias tiendas en un mismo mandado, envío por tienda, gratis desde 40 € en una tienda, pedido mínimo, aviso +18 para alcohol, «mandado libre» en notas.
- **Seguimiento** `/pedido?id=…`: pagado → comprando → en camino → entregado.
- **Panel de repartidor** `/repartidor`: pedidos con lista de compra por tienda, botón a Google Maps, llamar al cliente y avanzar el estado.
- **Servidor** `server/index.ts` (Node sin dependencias): crea el pago con Stripe Checkout usando los precios del catálogo del servidor (nunca los del navegador), confirma el pago por webhook firmado, guarda pedidos y avisa al repartidor por Telegram.

Sin `NEXT_PUBLIC_API_URL` la web funciona en **modo demo**: el pago es simulado y el pedido avanza solo.

## Arrancar
```bash
npm install
npm run dev     # web en http://localhost:3000 (modo demo)
npm test
npm run build   # web estática en out/
```

## Cobro real
1. Copia `server/.env.example` a `server/.env` y rellena Stripe, `RIDER_TOKEN` y (opcional) Telegram.
2. `npm run api` en tu servidor (hay un `server/mandader-api.service` para systemd) detrás de HTTPS.
3. En Stripe crea el webhook a `https://TU-API/api/stripe/webhook` con el evento `checkout.session.completed`.
4. En GitHub → Settings → Variables, añade `API_URL=https://TU-API` y vuelve a publicar.

## Catálogo
`data/catalog.json` (tiendas y productos de **demostración**, con emoji en lugar de foto). Sustitúyelo por las tiendas reales con las que llegues a acuerdo.
