import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ReportService } from "../../services/report.service";
import { ProductService } from "../../services/product.service";
import {
  ReportData,
  ReportFilter,
  CategoryStock,
  MonthlyMovement,
} from "../../models/report.model";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
          <p class="text-gray-600">Análisis y estadísticas del inventario</p>
        </div>
        <div class="flex space-x-3">
          <button
            (click)="exportReport()"
            class="btn btn-secondary flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <span>Exportar Reporte</span>
          </button>
          <button
            (click)="refreshReport()"
            class="btn btn-primary flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Filtros de reporte -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Filtros de Reporte
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              [(ngModel)]="reportFilter.fechaInicio"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              [(ngModel)]="reportFilter.fechaFin"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select [(ngModel)]="reportFilter.categoria" class="input">
              <option value="">Todas las categorías</option>
              <option
                *ngFor="let category of categories$ | async"
                [value]="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            (click)="applyFilters()"
            class="btn btn-primary mr-3"
            type="button"
          >
            Aplicar Filtros
          </button>
          <button
            (click)="clearFilters()"
            class="btn btn-secondary"
            type="button"
          >
            Limpiar
          </button>
        </div>
      </div>

      <!-- Métricas principales -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        *ngIf="reportData$ | async as report"
      >
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Productos</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ report.totalProducts }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"
                ></path>
                <path
                  fill-rule="evenodd"
                  d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-gray-500">
              Catálogo completo de productos
            </span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Total</p>
              <p class="text-3xl font-bold text-green-600">
                {{ report.totalStock }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-gray-500">Unidades en inventario</span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Valor Total</p>
              <p class="text-3xl font-bold text-purple-600">
                \${{ report.totalValue | number: "1.2-2" }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                ></path>
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-gray-500">Valor del inventario</span>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p class="text-3xl font-bold text-red-600">
                {{ getTotalAlerts(report.alertsSummary) }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-gray-500">
              Stock bajo, vencidos, etc.
            </span>
          </div>
        </div>
      </div>

      <!-- Gráficos y análisis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Stock por categoría -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Stock por Categoría
            </h3>
          </div>
          <div class="p-6">
            <div
              class="space-y-4"
              *ngIf="reportData$ | async as report; else loadingTemplate"
            >
              <div
                *ngFor="let category of report.stockByCategory"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ category.categoria }}
                  </h4>
                  <p class="text-xs text-gray-500">
                    {{ category.productos }} productos
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-900">
                    {{ category.cantidad }} unidades
                  </p>
                  <p class="text-xs text-gray-500">
                    \${{ category.valor | number: "1.2-2" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Productos más activos -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Productos Más Activos
            </h3>
          </div>
          <div class="p-6">
            <div
              class="space-y-4"
              *ngIf="reportData$ | async as report; else loadingTemplate"
            >
              <div
                *ngFor="let product of report.topProducts | slice: 0 : 5"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ product.nombre }}
                  </h4>
                  <p class="text-xs text-gray-500">
                    {{ product.cantidad }} en stock
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-primary-600">
                    {{ product.movimientos }} movimientos
                  </p>
                  <p class="text-xs text-gray-500">
                    \${{ product.valor | number: "1.2-2" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Movimientos por mes -->
      <div class="card">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Movimientos por Mes</h3>
        </div>
        <div class="p-6">
          <div
            class="overflow-x-auto"
            *ngIf="reportData$ | async as report; else loadingTemplate"
          >
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th
                    class="text-left py-3 px-4 text-sm font-medium text-gray-900"
                  >
                    Mes
                  </th>
                  <th
                    class="text-right py-3 px-4 text-sm font-medium text-gray-900"
                  >
                    Entradas
                  </th>
                  <th
                    class="text-right py-3 px-4 text-sm font-medium text-gray-900"
                  >
                    Salidas
                  </th>
                  <th
                    class="text-right py-3 px-4 text-sm font-medium text-gray-900"
                  >
                    Ajustes
                  </th>
                  <th
                    class="text-right py-3 px-4 text-sm font-medium text-gray-900"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let month of report.movementsByMonth"
                  class="border-b border-gray-100"
                >
                  <td class="py-3 px-4 text-sm text-gray-900">
                    {{ formatMonth(month.mes) }}
                  </td>
                  <td class="py-3 px-4 text-sm text-green-600 text-right">
                    +{{ month.entradas }}
                  </td>
                  <td class="py-3 px-4 text-sm text-red-600 text-right">
                    -{{ month.salidas }}
                  </td>
                  <td class="py-3 px-4 text-sm text-blue-600 text-right">
                    ±{{ month.ajustes }}
                  </td>
                  <td
                    class="py-3 px-4 text-sm font-medium text-gray-900 text-right"
                  >
                    {{ month.entradas + month.salidas + month.ajustes }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumen de alertas -->
      <div class="card">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Resumen de Alertas</h3>
        </div>
        <div class="p-6">
          <div
            class="grid grid-cols-1 md:grid-cols-4 gap-4"
            *ngIf="reportData$ | async as report; else loadingTemplate"
          >
            <div class="bg-yellow-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <svg
                    class="w-4 h-4 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ report.alertsSummary.stockBajo }}
                  </p>
                  <p class="text-sm text-gray-600">Stock Bajo</p>
                </div>
              </div>
            </div>

            <div class="bg-red-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <svg
                    class="w-4 h-4 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ report.alertsSummary.stockAgotado }}
                  </p>
                  <p class="text-sm text-gray-600">Stock Agotado</p>
                </div>
              </div>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <svg
                    class="w-4 h-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ report.alertsSummary.productosPorVencer }}
                  </p>
                  <p class="text-sm text-gray-600">Por Vencer</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3"
                >
                  <svg
                    class="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p class="text-lg font-bold text-gray-900">
                    {{ report.alertsSummary.productosVencidos }}
                  </p>
                  <p class="text-sm text-gray-600">Vencidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          ></div>
          <span class="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      </ng-template>
    </div>
  `,
})
export class ReportsComponent implements OnInit {
  reportData$: Observable<ReportData>;
  categories$: Observable<string[]>;

  reportFilter: ReportFilter = {};

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
  ) {
    this.reportData$ = this.reportService.getReportData();
    this.categories$ = this.productService
      .getProducts()
      .pipe(
        map((products) =>
          [...new Set(products.map((p) => p.categoria))].sort(),
        ),
      );
  }

  ngOnInit() {}

  applyFilters() {
    // Convertir strings de fecha a objetos Date si existen
    const filter: ReportFilter = { ...this.reportFilter };
    if (filter.fechaInicio) {
      filter.fechaInicio = new Date(filter.fechaInicio as any);
    }
    if (filter.fechaFin) {
      filter.fechaFin = new Date(filter.fechaFin as any);
    }

    this.reportData$ = this.reportService.getReportData(filter);
  }

  clearFilters() {
    this.reportFilter = {};
    this.reportData$ = this.reportService.getReportData();
  }

  refreshReport() {
    this.applyFilters();
  }

  exportReport() {
    this.reportData$.subscribe((report) => {
      // Crear un resumen completo para exportar
      const reportSummary = {
        fecha_generacion: new Date().toLocaleString("es-ES"),
        total_productos: report.totalProducts,
        stock_total: report.totalStock,
        valor_total: report.totalValue,
        productos_stock_bajo: report.lowStockProducts,
        productos_vencidos: report.expiredProducts,
        productos_por_vencer: report.expiringProducts,
        alertas_stock_bajo: report.alertsSummary.stockBajo,
        alertas_stock_agotado: report.alertsSummary.stockAgotado,
        alertas_productos_vencidos: report.alertsSummary.productosVencidos,
        alertas_productos_por_vencer: report.alertsSummary.productosPorVencer,
      };

      // Exportar stock por categoría
      const categoryData = report.stockByCategory.map((cat) => ({
        categoria: cat.categoria,
        productos: cat.productos,
        cantidad_total: cat.cantidad,
        valor_total: cat.valor,
      }));

      // Exportar productos más activos
      const topProductsData = report.topProducts.map((prod) => ({
        producto: prod.nombre,
        cantidad_stock: prod.cantidad,
        valor: prod.valor,
        movimientos: prod.movimientos,
      }));

      // Crear archivo CSV con resumen
      const csvContent = this.createReportCSV(
        reportSummary,
        categoryData,
        topProductsData,
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `reporte_inventario_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  formatMonth(monthStr: string): string {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  }

  getTotalAlerts(alertsSummary: any): number {
    return (
      alertsSummary.stockBajo +
      alertsSummary.stockAgotado +
      alertsSummary.productosVencidos +
      alertsSummary.productosPorVencer
    );
  }

  private createReportCSV(
    summary: any,
    categories: any[],
    topProducts: any[],
  ): string {
    let csv = "REPORTE GENERAL DE INVENTARIO\n\n";

    // Resumen general
    csv += "RESUMEN GENERAL\n";
    csv += "Indicador,Valor\n";
    Object.entries(summary).forEach(([key, value]) => {
      csv += `"${key.replace(/_/g, " ").toUpperCase()}","${value}"\n`;
    });

    csv += "\n\nSTOCK POR CATEGORIA\n";
    csv += "Categoría,Productos,Cantidad Total,Valor Total\n";
    categories.forEach((cat) => {
      csv += `"${cat.categoria}","${cat.productos}","${cat.cantidad_total}","${cat.valor_total}"\n`;
    });

    csv += "\n\nPRODUCTOS MAS ACTIVOS\n";
    csv += "Producto,Stock Actual,Valor,Movimientos\n";
    topProducts.forEach((prod) => {
      csv += `"${prod.producto}","${prod.cantidad_stock}","${prod.valor}","${prod.movimientos}"\n`;
    });

    return csv;
  }
}
