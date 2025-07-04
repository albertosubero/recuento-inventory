export interface OrderRequestProduct {
  id?: string;
  numeroOrden: string;
  descripcion: string;
  cantidadSolicitada: number;
  observaciones?: string;
}

export interface OrderRequest {
  id?: string;
  fecha: Date;
  numeroPedido: string;
  dependencia: string;
  productos: OrderRequestProduct[];
  funcionarioAutorizado: string;
  fechaCreacion: Date;
  estado: OrderRequestStatus;
}

export interface OrderRequestFormData {
  fecha: string;
  numeroPedido: string;
  dependencia: string;
  productos: OrderRequestProduct[];
  funcionarioAutorizado: string;
}

export enum OrderRequestStatus {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
  ENTREGADO = "ENTREGADO",
  CANCELADO = "CANCELADO",
}
