export type Categoria = "frescos" | "lacteos" | "despensa" | "panaderia" | "bebidas" | "congelados" | "limpieza" | "higiene" | "bebe" | "mascotas" | "platos" | "postres";
// Tipo de local, como las secciones de Glovo
export type TipoLocal = "super" | "restaurante" | "tienda";
export interface Tienda {
  id: string; nombre: string; categoria: Categoria; emoji: string; color: string;
  zona: string; tiempoMin: number; abre: string; cierra: string; valoracion: number;
  local?: boolean; tipo?: TipoLocal; // sin tipo = súper
}
export interface Producto {
  id: string; tiendaId: string; nombre: string; desc: string; precio: number;
  emoji: string; categoria: Categoria; tags: string[]; popular?: boolean;
  imagen?: string; marca?: string; fuente?: string;
  agotado?: boolean; local?: boolean; // local: lo ha subido una tienda desde el panel
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
