import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { ProductService } from "../../services/product.service";
import { Product, StockAlert } from "../../models/product.model";

@Component({
  selector: "app-inventory",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Estado del Inventario
          </h1>
          <p class="text-gray-600">Resumen actual del inventario y alertas</p>
        </div>
        <div class="flex space-x-3">
          <a
            routerLink="/inventario/historial"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Ver Historial</span>
          </a>
        </div>
      </div>

      <!-- Alertas -->
      <div
        class="card"
        *ngIf="(alerts$ | async) && (alerts$ | async)!.length > 0"
      >
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <svg
              class="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">
              Alertas de Inventario
            </h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              {{ (alerts$ | async)?.length }} alertas
            </span>
          </div>
        </div>
        <div class="divide-y divide-gray-200">
          <div *ngFor="let alert of alerts$ | async" class="p-4">
            <div class="flex items-start space-x-3">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
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
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ alert.message }}</p>
                <p class="text-xs text-gray-500">
                  {{ alert.fecha | date: "dd/MM/yyyy HH:mm" }}
                </p>
              </div>
              <button
                (click)="markAlertAsRead(alert.id!)"
                class="text-sm text-primary-600 hover:text-primary-800"
                *ngIf="!alert.leido"
              >
                Marcar como leído
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen por categorías -->
      <div class="card">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Inventario por Categorías
          </h3>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let category of categoryStats$ | async"
              class="bg-gray-50 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ category.name }}
                </h4>
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-green-100 text-green-800': category.totalStock > 50,
                    'bg-yellow-100 text-yellow-800':
                      category.totalStock > 10 && category.totalStock <= 50,
                    'bg-red-100 text-red-800': category.totalStock <= 10,
                  }"
                >
                  {{ category.productCount }} productos
                </span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Stock Total:</span>
                  <span class="font-medium">{{ category.totalStock }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Valor Total:</span>
                  <span class="font-medium">
                    \${{ category.totalValue | number: "1.2-2" }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Stock Bajo:</span>
                  <span
                    class="font-medium"
                    [ngClass]="{
                      'text-red-600': category.lowStockCount > 0,
                      'text-green-600': category.lowStockCount === 0,
                    }"
                  >
                    {{ category.lowStockCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos que requieren atención -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Stock bajo -->
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
              <p>No hay productos con stock bajo</p>
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
                  <p class="text-xs text-gray-500">{{ product.ubicacion }}</p>
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
                Ver todos →
              </a>
            </div>
          </div>
        </div>

        <!-- Productos próximos a vencer -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
              Productos Próximos a Vencer
            </h3>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              *ngIf="(expiringProducts$ | async)?.length === 0"
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
              <p>No hay productos próximos a vencer</p>
            </div>
            <div
              *ngFor="let product of expiringProducts$ | async | slice: 0 : 5"
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
                  <p class="text-xs text-gray-500">{{ product.ubicacion }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-900">
                    {{ product.fechaVencimiento | date: "dd/MM/yyyy" }}
                  </p>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="getExpirationClass(product.fechaVencimiento!)"
                  >
                    {{ getDaysUntilExpiration(product.fechaVencimiento!) }} días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            routerLink="/reportes"
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
                  d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Generar Reportes</p>
              <p class="text-xs text-gray-600">Análisis detallado</p>
            </div>
          </a>

          <a
            routerLink="/stock"
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
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Gestionar Stock</p>
              <p class="text-xs text-gray-600">Ajustar existencias</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class InventoryComponent implements OnInit {
  products$: Observable<Product[]>;
  alerts$: Observable<StockAlert[]>;
  lowStockProducts$: Observable<Product[]>;
  expiringProducts$: Observable<Product[]>;
  categoryStats$: Observable<any[]>;

  constructor(private productService: ProductService) {
    this.products$ = this.productService.getProducts();
    this.alerts$ = this.productService.getStockAlerts();
    this.lowStockProducts$ = this.productService.getLowStockProducts();

    this.expiringProducts$ = this.products$.pipe(
      map((products) =>
        products.filter((product) => {
          if (!product.fechaVencimiento) return false;
          const today = new Date();
          const expDate = new Date(product.fechaVencimiento);
          const diffTime = expDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        }),
      ),
    );

    this.categoryStats$ = this.products$.pipe(
      map((products) => {
        const categoryMap = new Map();

        products.forEach((product) => {
          const category = product.categoria;
          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              name: category,
              productCount: 0,
              totalStock: 0,
              totalValue: 0,
              lowStockCount: 0,
            });
          }

          const stats = categoryMap.get(category);
          stats.productCount++;
          stats.totalStock += product.cantidad;
          stats.totalValue += product.precio * product.cantidad;
          if (product.cantidad <= 10) {
            stats.lowStockCount++;
          }
        });

        return Array.from(categoryMap.values()).sort(
          (a, b) => b.totalValue - a.totalValue,
        );
      }),
    );
  }

  ngOnInit() {}

  markAlertAsRead(alertId: string) {
    this.productService.markAlertAsRead(alertId).subscribe({
      next: () => {
        console.log("Alerta marcada como leída");
      },
      error: (error) => {
        console.error("Error al marcar alerta como leída:", error);
      },
    });
  }

  getDaysUntilExpiration(expirationDate: Date): number {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getExpirationClass(expirationDate: Date): string {
    const days = this.getDaysUntilExpiration(expirationDate);
    if (days <= 7) return "bg-red-100 text-red-800";
    if (days <= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  }
}
