export type Categoria = "super" | "comida" | "farmacia" | "panaderia" | "fruteria" | "bebidas" | "hogar";
export interface Tienda {
  id: string; nombre: string; categoria: Categoria; emoji: string; color: string;
  zona: string; tiempoMin: number; abre: string; cierra: string; valoracion: number;
}
export interface Producto {
  id: string; tiendaId: string; nombre: string; desc: string; precio: number;
  emoji: string; categoria: Categoria; tags: string[]; popular?: boolean;
}
export interface LineaPedido { id: string; qty: number }
export type EstadoPedido = "pendiente_pago" | "pagado" | "comprando" | "en_camino" | "entregado" | "cancelado";
export interface Entrega {
  nombre: string; telefono: string; direccion: string; piso?: string; cp: string; notas?: string; cuando: string;
}
export interface Pedido {
  id: string; creado: number; estado: EstadoPedido; items: LineaPedido[]; entrega: Entrega;
  subtotal: number; envio: number; servicio: number; total: number;
  historial: { estado: EstadoPedido; t: number }[]; demo?: boolean;
}
