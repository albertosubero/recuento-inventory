import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { ProductService } from "../../services/product.service";
import { InventoryMovement, MovementType } from "../../models/product.model";

@Component({
  selector: "app-inventory-history",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Historial de Inventario
          </h1>
          <p class="text-gray-600">
            Registro completo de movimientos de inventario
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            (click)="exportHistory()"
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
            <span>Exportar</span>
          </button>
          <a
            routerLink="/inventario"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            <span>Volver al Inventario</span>
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              [(ngModel)]="dateFrom"
              (ngModelChange)="onDateFromChange($event)"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              [(ngModel)]="dateTo"
              (ngModelChange)="onDateToChange($event)"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
            </label>
            <select
              [(ngModel)]="selectedMovementType"
              (ngModelChange)="onMovementTypeChange($event)"
              class="input"
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEVOLUCION">Devolución</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="btn btn-secondary w-full"
              type="button"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas del período -->
      <div
        class="grid grid-cols-1 md:grid-cols-4 gap-6"
        *ngIf="periodStats$ | async as stats"
      >
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Entradas</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.totalEntradas }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Salidas</p>
              <p class="text-2xl font-bold text-red-600">
                {{ stats.totalSalidas }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Ajustes</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ stats.totalAjustes }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Movimientos</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ stats.totalMovimientos }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-gray-600"
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
          </div>
        </div>
      </div>

      <!-- Tabla de historial -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Movimientos de Inventario
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Fecha y Hora</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock Anterior</th>
                <th>Stock Nuevo</th>
                <th>Motivo</th>
                <th>Usuario</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(filteredMovements$ | async)?.length === 0">
                <td colspan="9" class="text-center py-8 text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-3 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <p>No se encontraron movimientos</p>
                    <p class="text-sm">
                      Ajusta los filtros para ver más resultados
                    </p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let movement of filteredMovements$ | async">
                <td class="text-sm text-gray-900">
                  {{ movement.fecha | date: "dd/MM/yyyy HH:mm" }}
                </td>
                <td>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ getProductName(movement.productId) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      ID: {{ movement.productId }}
                    </p>
                  </div>
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        movement.tipo === 'ENTRADA',
                      'bg-red-100 text-red-800': movement.tipo === 'SALIDA',
                      'bg-blue-100 text-blue-800': movement.tipo === 'AJUSTE',
                      'bg-purple-100 text-purple-800':
                        movement.tipo === 'TRANSFERENCIA',
                      'bg-yellow-100 text-yellow-800':
                        movement.tipo === 'DEVOLUCION',
                    }"
                  >
                    {{ movement.tipo }}
                  </span>
                </td>
                <td>
                  <span
                    class="text-sm font-medium"
                    [ngClass]="{
                      'text-green-600': movement.tipo === 'ENTRADA',
                      'text-red-600': movement.tipo === 'SALIDA',
                      'text-blue-600': movement.tipo === 'AJUSTE',
                    }"
                  >
                    {{
                      movement.tipo === "ENTRADA"
                        ? "+"
                        : movement.tipo === "SALIDA"
                          ? "-"
                          : "±"
                    }}{{ movement.cantidad }}
                  </span>
                </td>
                <td class="text-sm text-gray-900">
                  {{ movement.cantidadAnterior }}
                </td>
                <td class="text-sm font-medium text-gray-900">
                  {{ movement.cantidadNueva }}
                </td>
                <td class="text-sm text-gray-500 max-w-xs truncate">
                  {{ movement.motivo }}
                </td>
                <td class="text-sm text-gray-500">{{ movement.usuario }}</td>
                <td class="text-sm text-gray-500">{{ movement.ubicacion }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class InventoryHistoryComponent implements OnInit {
  movements$: Observable<InventoryMovement[]>;
  filteredMovements$: Observable<InventoryMovement[]>;
  periodStats$: Observable<any>;

  private dateFromSubject = new BehaviorSubject<string>("");
  private dateToSubject = new BehaviorSubject<string>("");
  private movementTypeSubject = new BehaviorSubject<string>("");

  dateFrom = "";
  dateTo = "";
  selectedMovementType = "";

  private productNames: { [key: string]: string } = {};

  constructor(private productService: ProductService) {
    this.movements$ = this.productService.getInventoryMovements();

    // Cargar nombres de productos para mostrar en el historial
    this.productService.getProducts().subscribe((products) => {
      this.productNames = products.reduce(
        (acc, product) => {
          acc[product.id!] = product.nombre;
          return acc;
        },
        {} as { [key: string]: string },
      );
    });

    this.filteredMovements$ = combineLatest([
      this.movements$,
      this.dateFromSubject.pipe(startWith("")),
      this.dateToSubject.pipe(startWith("")),
      this.movementTypeSubject.pipe(startWith("")),
    ]).pipe(
      map(([movements, dateFrom, dateTo, movementType]) => {
        return movements.filter((movement) => {
          let matches = true;

          if (dateFrom) {
            const fromDate = new Date(dateFrom);
            matches = matches && movement.fecha >= fromDate;
          }

          if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            matches = matches && movement.fecha <= toDate;
          }

          if (movementType) {
            matches = matches && movement.tipo === movementType;
          }

          return matches;
        });
      }),
    );

    this.periodStats$ = this.filteredMovements$.pipe(
      map((movements) => {
        const stats = {
          totalEntradas: 0,
          totalSalidas: 0,
          totalAjustes: 0,
          totalMovimientos: movements.length,
        };

        movements.forEach((movement) => {
          switch (movement.tipo) {
            case MovementType.ENTRADA:
              stats.totalEntradas += movement.cantidad;
              break;
            case MovementType.SALIDA:
              stats.totalSalidas += movement.cantidad;
              break;
            case MovementType.AJUSTE:
              stats.totalAjustes += movement.cantidad;
              break;
          }
        });

        return stats;
      }),
    );
  }

  ngOnInit() {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    this.dateTo = today.toISOString().split("T")[0];
    this.dateFrom = lastMonth.toISOString().split("T")[0];

    this.dateFromSubject.next(this.dateFrom);
    this.dateToSubject.next(this.dateTo);
  }

  onDateFromChange(date: string) {
    this.dateFromSubject.next(date);
  }

  onDateToChange(date: string) {
    this.dateToSubject.next(date);
  }

  onMovementTypeChange(type: string) {
    this.movementTypeSubject.next(type);
  }

  clearFilters() {
    this.dateFrom = "";
    this.dateTo = "";
    this.selectedMovementType = "";
    this.dateFromSubject.next("");
    this.dateToSubject.next("");
    this.movementTypeSubject.next("");
  }

  getProductName(productId: string): string {
    return this.productNames[productId] || "Producto no encontrado";
  }

  exportHistory() {
    this.filteredMovements$.subscribe((movements) => {
      const csvData = movements.map((movement) => ({
        Fecha: movement.fecha.toLocaleString("es-ES"),
        Producto: this.getProductName(movement.productId),
        "ID Producto": movement.productId,
        Tipo: movement.tipo,
        Cantidad: movement.cantidad,
        "Stock Anterior": movement.cantidadAnterior,
        "Stock Nuevo": movement.cantidadNueva,
        Motivo: movement.motivo,
        Usuario: movement.usuario,
        Ubicación: movement.ubicacion,
        Lote: movement.lote || "",
      }));

      const csv = this.convertToCSV(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `historial_inventario_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
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
