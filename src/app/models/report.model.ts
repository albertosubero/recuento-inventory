export interface ReportData {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  expiredProducts: number;
  expiringProducts: number;
  totalValue: number;
  topProducts: ProductSummary[];
  stockByCategory: CategoryStock[];
  movementsByMonth: MonthlyMovement[];
  alertsSummary: AlertsSummary;
}

export interface ProductSummary {
  id: string;
  nombre: string;
  cantidad: number;
  valor: number;
  movimientos: number;
}

export interface CategoryStock {
  categoria: string;
  cantidad: number;
  valor: number;
  productos: number;
}

export interface MonthlyMovement {
  mes: string;
  entradas: number;
  salidas: number;
  ajustes: number;
}

export interface AlertsSummary {
  stockBajo: number;
  productosVencidos: number;
  productosPorVencer: number;
  stockAgotado: number;
}

export interface ReportFilter {
  fechaInicio?: Date;
  fechaFin?: Date;
  categoria?: string;
  proveedor?: string;
  ubicacion?: string;
  estado?: string;
}

export interface ExportOptions {
  formato: "PDF" | "EXCEL" | "CSV";
  incluirImagenes: boolean;
  campos: string[];
}
