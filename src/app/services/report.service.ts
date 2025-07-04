import { Injectable } from "@angular/core";
import { Observable, combineLatest, map } from "rxjs";

import { ProductService } from "./product.service";
import {
  ReportData,
  ProductSummary,
  CategoryStock,
  MonthlyMovement,
  AlertsSummary,
  ReportFilter,
} from "../models/report.model";
import {
  Product,
  InventoryMovement,
  StockAlert,
  AlertType,
} from "../models/product.model";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private productService: ProductService) {}

  getReportData(filter?: ReportFilter): Observable<ReportData> {
    return combineLatest([
      this.productService.getProducts(),
      this.productService.getInventoryMovements(),
      this.productService.getStockAlerts(),
    ]).pipe(
      map(([products, movements, alerts]) => {
        let filteredProducts = products;
        let filteredMovements = movements;

        // Aplicar filtros si existen
        if (filter) {
          filteredProducts = this.applyProductFilters(products, filter);
          filteredMovements = this.applyMovementFilters(movements, filter);
        }

        return this.generateReportData(
          filteredProducts,
          filteredMovements,
          alerts,
        );
      }),
    );
  }

  private applyProductFilters(
    products: Product[],
    filter: ReportFilter,
  ): Product[] {
    let filtered = products;

    if (filter.categoria) {
      filtered = filtered.filter((p) => p.categoria === filter.categoria);
    }

    if (filter.proveedor) {
      filtered = filtered.filter((p) => p.proveedor === filter.proveedor);
    }

    if (filter.ubicacion) {
      filtered = filtered.filter((p) => p.ubicacion === filter.ubicacion);
    }

    if (filter.estado) {
      filtered = filtered.filter((p) => p.status === filter.estado);
    }

    return filtered;
  }

  private applyMovementFilters(
    movements: InventoryMovement[],
    filter: ReportFilter,
  ): InventoryMovement[] {
    let filtered = movements;

    if (filter.fechaInicio) {
      filtered = filtered.filter((m) => m.fecha >= filter.fechaInicio!);
    }

    if (filter.fechaFin) {
      filtered = filtered.filter((m) => m.fecha <= filter.fechaFin!);
    }

    return filtered;
  }

  private generateReportData(
    products: Product[],
    movements: InventoryMovement[],
    alerts: StockAlert[],
  ): ReportData {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.cantidad, 0);
    const lowStockProducts = products.filter((p) => p.cantidad <= 10).length;
    const expiredProducts = products.filter((p) => this.isExpired(p)).length;
    const expiringProducts = products.filter((p) =>
      this.isExpiringSoon(p),
    ).length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.precio * p.cantidad,
      0,
    );

    return {
      totalProducts,
      totalStock,
      lowStockProducts,
      expiredProducts,
      expiringProducts,
      totalValue,
      topProducts: this.getTopProducts(products, movements),
      stockByCategory: this.getStockByCategory(products),
      movementsByMonth: this.getMovementsByMonth(movements),
      alertsSummary: this.getAlertsSummary(alerts),
    };
  }

  private getTopProducts(
    products: Product[],
    movements: InventoryMovement[],
  ): ProductSummary[] {
    const productMovements = new Map<string, number>();

    movements.forEach((movement) => {
      const current = productMovements.get(movement.productId) || 0;
      productMovements.set(movement.productId, current + movement.cantidad);
    });

    return products
      .map((product) => ({
        id: product.id!,
        nombre: product.nombre,
        cantidad: product.cantidad,
        valor: product.precio * product.cantidad,
        movimientos: productMovements.get(product.id!) || 0,
      }))
      .sort((a, b) => b.movimientos - a.movimientos)
      .slice(0, 10);
  }

  private getStockByCategory(products: Product[]): CategoryStock[] {
    const categoryMap = new Map<string, CategoryStock>();

    products.forEach((product) => {
      const existing = categoryMap.get(product.categoria) || {
        categoria: product.categoria,
        cantidad: 0,
        valor: 0,
        productos: 0,
      };

      existing.cantidad += product.cantidad;
      existing.valor += product.precio * product.cantidad;
      existing.productos += 1;

      categoryMap.set(product.categoria, existing);
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.valor - a.valor);
  }

  private getMovementsByMonth(
    movements: InventoryMovement[],
  ): MonthlyMovement[] {
    const monthMap = new Map<string, MonthlyMovement>();

    movements.forEach((movement) => {
      const monthKey = movement.fecha.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthMap.get(monthKey) || {
        mes: monthKey,
        entradas: 0,
        salidas: 0,
        ajustes: 0,
      };

      switch (movement.tipo) {
        case "ENTRADA":
          existing.entradas += movement.cantidad;
          break;
        case "SALIDA":
          existing.salidas += movement.cantidad;
          break;
        case "AJUSTE":
          existing.ajustes += movement.cantidad;
          break;
      }

      monthMap.set(monthKey, existing);
    });

    return Array.from(monthMap.values()).sort((a, b) =>
      a.mes.localeCompare(b.mes),
    );
  }

  private getAlertsSummary(alerts: StockAlert[]): AlertsSummary {
    return {
      stockBajo: alerts.filter((a) => a.tipo === AlertType.STOCK_BAJO).length,
      productosVencidos: alerts.filter(
        (a) => a.tipo === AlertType.PRODUCTO_VENCIDO,
      ).length,
      productosPorVencer: alerts.filter(
        (a) => a.tipo === AlertType.PRODUCTO_POR_VENCER,
      ).length,
      stockAgotado: alerts.filter((a) => a.tipo === AlertType.STOCK_AGOTADO)
        .length,
    };
  }

  private isExpired(product: Product): boolean {
    if (!product.fechaVencimiento) return false;
    return new Date() > product.fechaVencimiento;
  }

  private isExpiringSoon(
    product: Product,
    daysThreshold: number = 30,
  ): boolean {
    if (!product.fechaVencimiento) return false;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return (
      product.fechaVencimiento <= threshold &&
      product.fechaVencimiento > new Date()
    );
  }

  exportToCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((item) =>
      Object.values(item)
        .map((value) => `"${value}"`)
        .join(","),
    );

    return [headers, ...rows].join("\n");
  }
}
