export interface Product {
  id?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  proveedor: string;
  cantidad: number;
  codigo1: string;
  codigo2: string;
  imagenes: string[];
  rubro: string;
  categoria: string;
  marca: string;
  fechaVencimiento?: Date;
  lote?: string;
  status: ProductStatus;
  notas?: string;
  ubicacion: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export enum ProductStatus {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  AGOTADO = "AGOTADO",
  VENCIDO = "VENCIDO",
  RESERVADO = "RESERVADO",
}

export interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  proveedor: string;
  cantidad: number;
  codigo1: string;
  codigo2: string;
  rubro: string;
  categoria: string;
  marca: string;
  fechaVencimiento?: string;
  lote?: string;
  status: ProductStatus;
  notas?: string;
  ubicacion: string;
}

export interface InventoryMovement {
  id?: string;
  productId: string;
  tipo: MovementType;
  cantidad: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  motivo: string;
  usuario: string;
  fecha: Date;
  lote?: string;
  ubicacion: string;
}

export enum MovementType {
  ENTRADA = "ENTRADA",
  SALIDA = "SALIDA",
  AJUSTE = "AJUSTE",
  TRANSFERENCIA = "TRANSFERENCIA",
  DEVOLUCION = "DEVOLUCION",
}

export interface StockAlert {
  id?: string;
  productId: string;
  tipo: AlertType;
  message: string;
  fecha: Date;
  leido: boolean;
}

export enum AlertType {
  STOCK_BAJO = "STOCK_BAJO",
  PRODUCTO_VENCIDO = "PRODUCTO_VENCIDO",
  PRODUCTO_POR_VENCER = "PRODUCTO_POR_VENCER",
  STOCK_AGOTADO = "STOCK_AGOTADO",
}
