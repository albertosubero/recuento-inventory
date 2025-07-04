export interface InvoiceProduct {
  id?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoId?: string; // Reference to existing product in inventory
}

export interface InvoiceDocument {
  id?: string;
  nombre: string;
  url: string;
  tipo: string; // 'image/pdf', 'image/jpeg', etc.
  tamaño: number;
  fechaSubida: Date;
}

export interface Invoice {
  id?: string;
  numeroFactura: string;
  fecha: Date;
  proveedor: string;
  productos: InvoiceProduct[];
  montoTotal: number;
  documentos: InvoiceDocument[];
  solicitudPedidoId?: string; // Reference to order request
  estado: InvoiceStatus;
  fechaCreacion: Date;
  usuarioCreacion: string;
  notas?: string;
}

export enum InvoiceStatus {
  PENDIENTE = "PENDIENTE",
  PROCESADA = "PROCESADA",
  RECHAZADA = "RECHAZADA",
}

export interface InvoiceFormData {
  numeroFactura: string;
  fecha: string;
  proveedor: string;
  productos: InvoiceProduct[];
  montoTotal: number;
  solicitudPedidoId?: string;
  notas?: string;
}

// Model for delivery/exit orders
export interface DeliveryOrder {
  id?: string;
  solicitudPedidoId: string;
  numeroSalida: string;
  fechaEntrega: Date;
  funcionarioAutorizado: string;
  funcionarioEntrega: string;
  productos: DeliveryProduct[];
  observaciones?: string;
  firmaDigital?: string; // Base64 encoded signature
  estado: DeliveryStatus;
  fechaCreacion: Date;
}

export interface DeliveryProduct {
  productoId: string;
  descripcion: string;
  cantidadSolicitada: number;
  cantidadEntregada: number;
  observaciones?: string;
}

export enum DeliveryStatus {
  PENDIENTE = "PENDIENTE",
  ENTREGADO = "ENTREGADO",
  PARCIAL = "PARCIAL",
}

export interface DeliveryFormData {
  solicitudPedidoId: string;
  fechaEntrega: string;
  funcionarioAutorizado: string;
  funcionarioEntrega: string;
  productos: DeliveryProduct[];
  observaciones?: string;
  firmaDigital?: string;
}
