import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { InvoiceService } from "../../services/invoice.service";
import { Invoice, InvoiceStatus } from "../../models/invoice.model";

@Component({
  selector: "app-invoice-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Registro de Facturas</h1>
          <p class="text-gray-600">Gestión de facturas registradas</p>
        </div>
        <a
          routerLink="/registro-factura"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          <span>Registrar Factura</span>
        </a>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Facturas</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ (invoices$ | async)?.length || 0 }}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ getStatusCount(InvoiceStatus.PENDIENTE) | async }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-yellow-600"
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
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Procesadas</p>
              <p class="text-2xl font-bold text-green-600">
                {{ getStatusCount(InvoiceStatus.PROCESADA) | async }}
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
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Monto Total</p>
              <p class="text-2xl font-bold text-purple-600">
                \${{ getTotalAmount() | async | number: "1.2-2" }}
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
        </div>
      </div>

      <!-- Lista de facturas -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Facturas Recientes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Número de Factura</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Documentos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(invoices$ | async)?.length === 0">
                <td colspan="8" class="text-center py-8 text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <p class="font-medium">No hay facturas registradas</p>
                    <p class="text-sm">
                      Registra tu primera factura haciendo clic en "Registrar
                      Factura"
                    </p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let invoice of invoices$ | async">
                <td>
                  <div class="font-medium text-gray-900">
                    {{ invoice.numeroFactura }}
                  </div>
                  <div class="text-xs text-gray-500">ID: {{ invoice.id }}</div>
                </td>
                <td class="text-sm text-gray-500">
                  {{ invoice.fecha | date: "dd/MM/yyyy" }}
                </td>
                <td>
                  <div class="text-sm text-gray-900">
                    {{ invoice.proveedor }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-gray-500">
                    {{ invoice.productos.length }} producto{{
                      invoice.productos.length !== 1 ? "s" : ""
                    }}
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ getTotalProductQuantity(invoice) }}
                    unidades
                  </div>
                </td>
                <td>
                  <div class="text-sm font-medium text-gray-900">
                    \${{ invoice.montoTotal | number: "1.2-2" }}
                  </div>
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800':
                        invoice.estado === 'PENDIENTE',
                      'bg-green-100 text-green-800':
                        invoice.estado === 'PROCESADA',
                      'bg-red-100 text-red-800': invoice.estado === 'RECHAZADA',
                    }"
                  >
                    {{ invoice.estado }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center space-x-1">
                    <svg
                      class="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      ></path>
                    </svg>
                    <span class="text-sm text-gray-500">
                      {{ invoice.documentos.length }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="viewDetails(invoice)"
                      class="text-primary-600 hover:text-primary-900 text-sm"
                      title="Ver detalles"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </button>
                    <div
                      class="relative"
                      *ngIf="invoice.estado === 'PENDIENTE'"
                    >
                      <button
                        (click)="toggleStatusMenu(invoice.id!)"
                        class="text-gray-600 hover:text-gray-900 text-sm"
                        title="Cambiar estado"
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          ></path>
                        </svg>
                      </button>
                      <div
                        *ngIf="openStatusMenu === invoice.id"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      >
                        <div class="py-1">
                          <button
                            (click)="
                              updateStatus(invoice.id!, InvoiceStatus.PROCESADA)
                            "
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Marcar como Procesada
                          </button>
                          <button
                            (click)="
                              updateStatus(invoice.id!, InvoiceStatus.RECHAZADA)
                            "
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class InvoiceListComponent implements OnInit {
  invoices$: Observable<Invoice[]>;
  openStatusMenu: string | null = null;
  InvoiceStatus = InvoiceStatus;

  constructor(private invoiceService: InvoiceService) {
    this.invoices$ = this.invoiceService.getInvoices();
  }

  ngOnInit() {}

  getStatusCount(status: InvoiceStatus): Observable<number> {
    return this.invoices$.pipe(
      map(
        (invoices) =>
          invoices.filter((invoice) => invoice.estado === status).length,
      ),
    );
  }

  getTotalAmount(): Observable<number> {
    return this.invoices$.pipe(
      map((invoices) =>
        invoices.reduce((total, invoice) => total + invoice.montoTotal, 0),
      ),
    );
  }

  getTotalProductQuantity(invoice: Invoice): number {
    return invoice.productos.reduce(
      (total, product) => total + product.cantidad,
      0,
    );
  }

  viewDetails(invoice: Invoice): void {
    // Create a formatted details string
    let details = `FACTURA REGISTRADA\n\n`;
    details += `Número: ${invoice.numeroFactura}\n`;
    details += `Fecha: ${invoice.fecha.toLocaleDateString("es-ES")}\n`;
    details += `Proveedor: ${invoice.proveedor}\n`;
    details += `Estado: ${invoice.estado}\n`;
    details += `Monto Total: $${invoice.montoTotal.toFixed(2)}\n\n`;
    details += `PRODUCTOS:\n`;

    invoice.productos.forEach((product, index) => {
      details += `\n${index + 1}. ${product.descripcion}\n`;
      details += `   Cantidad: ${product.cantidad}\n`;
      details += `   Precio Unitario: $${product.precioUnitario.toFixed(2)}\n`;
      details += `   Subtotal: $${product.subtotal.toFixed(2)}\n`;
    });

    if (invoice.notas) {
      details += `\nNOTAS:\n${invoice.notas}`;
    }

    if (invoice.documentos.length > 0) {
      details += `\nDOCUMENTOS: ${invoice.documentos.length} archivo(s)`;
    }

    alert(details);
  }

  toggleStatusMenu(invoiceId: string): void {
    this.openStatusMenu = this.openStatusMenu === invoiceId ? null : invoiceId;
  }

  updateStatus(invoiceId: string, status: InvoiceStatus): void {
    this.invoiceService.updateInvoiceStatus(invoiceId, status).subscribe({
      next: () => {
        console.log(`Invoice status updated to ${status}`);
        this.openStatusMenu = null;
      },
      error: (error) => {
        console.error("Error updating status:", error);
        alert("Error al actualizar el estado");
      },
    });
  }
}
