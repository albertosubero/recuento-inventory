import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";

import { ProductService } from "../../services/product.service";
import { ReportService } from "../../services/report.service";
import { AuthService } from "../../services/auth.service";
import { Product, StockAlert } from "../../models/product.model";
import { ReportData } from "../../models/report.model";
import { User } from "../../models/user.model";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600">Resumen general del inventario</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">
            Bienvenido, {{ currentUser?.nombre }}
          </p>
          <p class="text-sm text-gray-500">
            {{ currentDate | date: "dd/MM/yyyy" }}
          </p>
        </div>
      </div>

      <!-- Tarjetas de resumen -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        *ngIf="reportData$ | async as report"
      >
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Productos</p>
              <p class="text-2xl font-bold text-gray-900">
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
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Total</p>
              <p class="text-2xl font-bold text-gray-900">
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
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Valor Total</p>
              <p class="text-2xl font-bold text-gray-900">
                \${{ report.totalValue | number: "1.2-2" }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-yellow-600"
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
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Alertas</p>
              <p class="text-2xl font-bold text-red-600">
                {{ (alerts$ | async)?.length || 0 }}
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
        </div>
      </div>

      <!-- Sección de alertas y productos con stock bajo -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Alertas -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Alertas Recientes</h3>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              *ngIf="(alerts$ | async)?.length === 0"
              class="p-6 text-center text-gray-500"
            >
              <svg
                class="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <p>No hay alertas pendientes</p>
            </div>
            <div
              *ngFor="let alert of alerts$ | async | slice: 0 : 5"
              class="p-4"
            >
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    [ngClass]="{
                      'bg-red-100':
                        alert.tipo === 'STOCK_AGOTADO' ||
                        alert.tipo === 'PRODUCTO_VENCIDO',
                      'bg-yellow-100':
                        alert.tipo === 'STOCK_BAJO' ||
                        alert.tipo === 'PRODUCTO_POR_VENCER',
                    }"
                  >
                    <svg
                      class="w-4 h-4"
                      [ngClass]="{
                        'text-red-600':
                          alert.tipo === 'STOCK_AGOTADO' ||
                          alert.tipo === 'PRODUCTO_VENCIDO',
                        'text-yellow-600':
                          alert.tipo === 'STOCK_BAJO' ||
                          alert.tipo === 'PRODUCTO_POR_VENCER',
                      }"
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
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">{{ alert.message }}</p>
                  <p class="text-xs text-gray-500">
                    {{ alert.fecha | date: "dd/MM/yyyy HH:mm" }}
                  </p>
                </div>
              </div>
            </div>
            <div
              *ngIf="(alerts$ | async) && (alerts$ | async)!.length > 5"
              class="p-4 bg-gray-50"
            >
              <a
                routerLink="/inventario"
                class="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todas las alertas →
              </a>
            </div>
          </div>
        </div>

        <!-- Productos con stock bajo -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Productos con Stock Bajo
            </h3>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              *ngIf="(lowStockProducts$ | async)?.length === 0"
              class="p-6 text-center text-gray-500"
            >
              <svg
                class="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <p>Todos los productos tienen stock suficiente</p>
            </div>
            <div
              *ngFor="let product of lowStockProducts$ | async | slice: 0 : 5"
              class="p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ product.nombre }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ product.marca }} - {{ product.codigo1 }}
                  </p>
                </div>
                <div class="text-right">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-red-100 text-red-800': product.cantidad === 0,
                      'bg-yellow-100 text-yellow-800':
                        product.cantidad > 0 && product.cantidad <= 5,
                      'bg-orange-100 text-orange-800':
                        product.cantidad > 5 && product.cantidad <= 10,
                    }"
                  >
                    {{ product.cantidad }} unidades
                  </span>
                </div>
              </div>
            </div>
            <div
              *ngIf="
                (lowStockProducts$ | async) &&
                (lowStockProducts$ | async)!.length > 5
              "
              class="p-4 bg-gray-50"
            >
              <a
                routerLink="/stock"
                class="text-sm text-primary-600 hover:text-primary-500"
              >
                Ver todos los productos →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Accesos Rápidos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            routerLink="/productos/nuevo"
            class="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
          >
            <div
              class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-5 h-5 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Agregar Producto</p>
              <p class="text-xs text-gray-600">Nuevo producto al inventario</p>
            </div>
          </a>

          <a
            routerLink="/inventario/historial"
            class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-5 h-5 text-green-600"
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
              <p class="text-sm font-medium text-gray-900">Ver Historial</p>
              <p class="text-xs text-gray-600">Movimientos de inventario</p>
            </div>
          </a>

          <a
            routerLink="/reportes"
            class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
          >
            <div
              class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Generar Reportes</p>
              <p class="text-xs text-gray-600">Análisis y estadísticas</p>
            </div>
          </a>

          <a
            routerLink="/stock"
            class="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
          >
            <div
              class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Gestionar Stock</p>
              <p class="text-xs text-gray-600">Control de existencias</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentDate = new Date();
  reportData$: Observable<ReportData>;
  alerts$: Observable<StockAlert[]>;
  lowStockProducts$: Observable<Product[]>;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private reportService: ReportService,
  ) {
    this.reportData$ = this.reportService.getReportData();
    this.alerts$ = this.productService.getStockAlerts();
    this.lowStockProducts$ = this.productService.getLowStockProducts();
  }

  ngOnInit() {
    this.authService.authState$.subscribe((authState) => {
      this.currentUser = authState.user;
    });
  }
}
