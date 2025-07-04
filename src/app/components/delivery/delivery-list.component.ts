import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DeliveryService } from "../../services/delivery.service";
import { DeliveryOrder, DeliveryStatus } from "../../models/invoice.model";

@Component({
  selector: "app-delivery-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Registro de Entregas</h1>
          <p class="text-gray-600">Gestión de entregas y salidas de pedidos</p>
        </div>
        <a
          routerLink="/salida-pedido"
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
          <span>Nueva Entrega</span>
        </a>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Entregas</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ (deliveries$ | async)?.length || 0 }}
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
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
                {{ getStatusCount(DeliveryStatus.PENDIENTE) | async }}
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
              <p class="text-sm font-medium text-gray-600">Entregadas</p>
              <p class="text-2xl font-bold text-green-600">
                {{ getStatusCount(DeliveryStatus.ENTREGADO) | async }}
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
              <p class="text-sm font-medium text-gray-600">Parciales</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ getStatusCount(DeliveryStatus.PARCIAL) | async }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de entregas -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Entregas Recientes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Número de Salida</th>
                <th>Fecha Entrega</th>
                <th>Funcionario Autorizado</th>
                <th>Funcionario Entrega</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(deliveries$ | async)?.length === 0">
                <td colspan="7" class="text-center py-8 text-gray-500">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      ></path>
                    </svg>
                    <p class="font-medium">No hay entregas registradas</p>
                    <p class="text-sm">
                      Procesa tu primera entrega haciendo clic en "Nueva
                      Entrega"
                    </p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let delivery of deliveries$ | async">
                <td>
                  <div class="font-medium text-gray-900">
                    {{ delivery.numeroSalida }}
                  </div>
                  <div class="text-xs text-gray-500">
                    ID: {{ delivery.solicitudPedidoId }}
                  </div>
                </td>
                <td class="text-sm text-gray-500">
                  {{ delivery.fechaEntrega | date: "dd/MM/yyyy HH:mm" }}
                </td>
                <td>
                  <div class="text-sm text-gray-900">
                    {{ delivery.funcionarioAutorizado }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-gray-900">
                    {{ delivery.funcionarioEntrega }}
                  </div>
                </td>
                <td>
                  <div class="text-sm text-gray-500">
                    {{ delivery.productos.length }} producto{{
                      delivery.productos.length !== 1 ? "s" : ""
                    }}
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ getTotalEntregado(delivery) }}/{{
                      getTotalSolicitado(delivery)
                    }}
                    unidades
                  </div>
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800':
                        delivery.estado === 'PENDIENTE',
                      'bg-green-100 text-green-800':
                        delivery.estado === 'ENTREGADO',
                      'bg-purple-100 text-purple-800':
                        delivery.estado === 'PARCIAL',
                    }"
                  >
                    {{ delivery.estado }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="viewDetails(delivery)"
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
                    <button
                      (click)="printDeliveryReceipt(delivery)"
                      class="text-green-600 hover:text-green-900 text-sm"
                      title="Imprimir comprobante"
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
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        ></path>
                      </svg>
                    </button>
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
export class DeliveryListComponent implements OnInit {
  deliveries$: Observable<DeliveryOrder[]>;
  DeliveryStatus = DeliveryStatus;

  constructor(private deliveryService: DeliveryService) {
    this.deliveries$ = this.deliveryService.getDeliveries();
  }

  ngOnInit() {}

  getStatusCount(status: DeliveryStatus): Observable<number> {
    return this.deliveries$.pipe(
      map(
        (deliveries) =>
          deliveries.filter((delivery) => delivery.estado === status).length,
      ),
    );
  }

  getTotalSolicitado(delivery: DeliveryOrder): number {
    return delivery.productos.reduce(
      (total, product) => total + product.cantidadSolicitada,
      0,
    );
  }

  getTotalEntregado(delivery: DeliveryOrder): number {
    return delivery.productos.reduce(
      (total, product) => total + product.cantidadEntregada,
      0,
    );
  }

  viewDetails(delivery: DeliveryOrder): void {
    // Create a formatted details string
    let details = `COMPROBANTE DE ENTREGA\n\n`;
    details += `Número de Salida: ${delivery.numeroSalida}\n`;
    details += `Fecha de Entrega: ${delivery.fechaEntrega.toLocaleDateString("es-ES")} ${delivery.fechaEntrega.toLocaleTimeString("es-ES")}\n`;
    details += `Funcionario Autorizado: ${delivery.funcionarioAutorizado}\n`;
    details += `Funcionario que Entrega: ${delivery.funcionarioEntrega}\n`;
    details += `Estado: ${delivery.estado}\n\n`;
    details += `PRODUCTOS ENTREGADOS:\n`;

    delivery.productos.forEach((product, index) => {
      details += `\n${index + 1}. ${product.descripcion}\n`;
      details += `   Solicitado: ${product.cantidadSolicitada}\n`;
      details += `   Entregado: ${product.cantidadEntregada}\n`;
      if (product.observaciones) {
        details += `   Observaciones: ${product.observaciones}\n`;
      }
    });

    if (delivery.observaciones) {
      details += `\nOBSERVACIONES GENERALES:\n${delivery.observaciones}`;
    }

    const totalSolicitado = this.getTotalSolicitado(delivery);
    const totalEntregado = this.getTotalEntregado(delivery);
    details += `\n\nRESUMEN:\n`;
    details += `Total Solicitado: ${totalSolicitado} unidades\n`;
    details += `Total Entregado: ${totalEntregado} unidades\n`;
    details += `Estado de Entrega: ${delivery.estado}`;

    alert(details);
  }

  printDeliveryReceipt(delivery: DeliveryOrder): void {
    // Generate a printable receipt
    const printContent = this.generatePrintableReceipt(delivery);
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      alert("No se pudo abrir la ventana de impresión");
    }
  }

  private generatePrintableReceipt(delivery: DeliveryOrder): string {
    const totalSolicitado = this.getTotalSolicitado(delivery);
    const totalEntregado = this.getTotalEntregado(delivery);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Comprobante de Entrega - ${delivery.numeroSalida}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .info-section { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .products-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .products-table th, .products-table td { border: 1px solid #000; padding: 8px; text-align: left; }
        .products-table th { background-color: #f0f0f0; }
        .summary { border-top: 2px solid #000; padding-top: 10px; }
        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { text-align: center; border-top: 1px solid #000; width: 200px; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COMPROBANTE DE ENTREGA</h1>
        <h2>${delivery.numeroSalida}</h2>
      </div>

      <div class="info-section">
        <div class="info-row">
          <strong>Fecha de Entrega:</strong>
          <span>${delivery.fechaEntrega.toLocaleDateString("es-ES")} ${delivery.fechaEntrega.toLocaleTimeString("es-ES")}</span>
        </div>
        <div class="info-row">
          <strong>Funcionario Autorizado:</strong>
          <span>${delivery.funcionarioAutorizado}</span>
        </div>
        <div class="info-row">
          <strong>Funcionario que Entrega:</strong>
          <span>${delivery.funcionarioEntrega}</span>
        </div>
        <div class="info-row">
          <strong>Estado:</strong>
          <span>${delivery.estado}</span>
        </div>
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad Solicitada</th>
            <th>Cantidad Entregada</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${delivery.productos
            .map(
              (product) => `
            <tr>
              <td>${product.descripcion}</td>
              <td>${product.cantidadSolicitada}</td>
              <td>${product.cantidadEntregada}</td>
              <td>${product.observaciones || "-"}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="summary">
        <div class="info-row">
          <strong>Total Solicitado:</strong>
          <span>${totalSolicitado} unidades</span>
        </div>
        <div class="info-row">
          <strong>Total Entregado:</strong>
          <span>${totalEntregado} unidades</span>
        </div>
      </div>

      ${
        delivery.observaciones
          ? `
      <div class="info-section">
        <strong>Observaciones:</strong>
        <p>${delivery.observaciones}</p>
      </div>
      `
          : ""
      }

      <div class="signatures">
        <div class="signature-box">
          <div>Firma Funcionario Autorizado</div>
          <div>${delivery.funcionarioAutorizado}</div>
        </div>
        <div class="signature-box">
          <div>Firma Funcionario que Entrega</div>
          <div>${delivery.funcionarioEntrega}</div>
        </div>
      </div>

      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        Documento generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}
      </div>
    </body>
    </html>
    `;
  }
}
