import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Observable } from "rxjs";

import { OrderRequestService } from "../../services/order-request.service";
import {
  OrderRequest,
  OrderRequestStatus,
} from "../../models/order-request.model";

@Component({
  selector: "app-order-request-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Solicitudes de Pedido
          </h1>
          <p class="text-gray-600">
            Gestión de solicitudes de pedidos de inventario
          </p>
        </div>
        <a
          routerLink="/solicitudes/nueva"
          class="btn btn-primary flex items-center space-x-2"
        >
          <svg
            class="w-5 h-5"
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
          <span>Nueva Solicitud</span>
        </a>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Solicitudes</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ (orderRequests$ | async)?.length || 0 }}
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
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                <path
                  fill-rule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                  clip-rule="evenodd"
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
                {{ getPendingCount() }}
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
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Aprobadas</p>
              <p class="text-2xl font-bold text-green-600">
                {{ getApprovedCount() }}
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
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Entregadas</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ getDeliveredCount() }}
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
                  d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                ></path>
                <path
                  d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de solicitudes -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Número de Pedido</th>
                <th>Fecha</th>
                <th>Dependencia</th>
                <th>Funcionario Autorizado</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(orderRequests$ | async)?.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-16 h-16 mb-4 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                      <path
                        fill-rule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <p class="text-lg font-medium">No hay solicitudes</p>
                    <p class="text-sm">Crea tu primera solicitud de pedido</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let orderRequest of orderRequests$ | async">
                <td>
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
                      >
                        <svg
                          class="w-5 h-5 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                          <path
                            fill-rule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">
                        {{ orderRequest.numeroPedido }}
                      </p>
                      <p class="text-xs text-gray-500">
                        ID: {{ orderRequest.id }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="text-sm text-gray-900">
                  {{ orderRequest.fecha | date: "dd/MM/yyyy" }}
                </td>
                <td class="text-sm text-gray-900">
                  {{ orderRequest.dependencia }}
                </td>
                <td class="text-sm text-gray-900">
                  {{ orderRequest.funcionarioAutorizado }}
                </td>
                <td class="text-sm text-gray-500">
                  {{ orderRequest.productos.length }} productos
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800':
                        orderRequest.estado === 'PENDIENTE',
                      'bg-green-100 text-green-800':
                        orderRequest.estado === 'APROBADO',
                      'bg-red-100 text-red-800':
                        orderRequest.estado === 'RECHAZADO',
                      'bg-blue-100 text-blue-800':
                        orderRequest.estado === 'ENTREGADO',
                      'bg-gray-100 text-gray-800':
                        orderRequest.estado === 'CANCELADO',
                    }"
                  >
                    {{ orderRequest.estado }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="viewOrderRequest(orderRequest)"
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
                    <a
                      [routerLink]="['/solicitudes', orderRequest.id, 'editar']"
                      class="text-green-600 hover:text-green-900 text-sm"
                      title="Editar"
                      *ngIf="orderRequest.estado === 'PENDIENTE'"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </a>
                    <button
                      (click)="deleteOrderRequest(orderRequest)"
                      class="text-red-600 hover:text-red-900 text-sm"
                      title="Eliminar"
                      *ngIf="orderRequest.estado === 'PENDIENTE'"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
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

    <!-- Modal de detalles -->
    <div
      *ngIf="selectedOrderRequest"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      (click)="closeModal()"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
        (click)="$event.stopPropagation()"
      >
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Detalles de la Solicitud
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">
                  Número de Pedido
                </p>
                <p class="text-sm text-gray-900">
                  {{ selectedOrderRequest.numeroPedido }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Fecha</p>
                <p class="text-sm text-gray-900">
                  {{ selectedOrderRequest.fecha | date: "dd/MM/yyyy" }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Dependencia</p>
                <p class="text-sm text-gray-900">
                  {{ selectedOrderRequest.dependencia }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Estado</p>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800':
                      selectedOrderRequest.estado === 'PENDIENTE',
                    'bg-green-100 text-green-800':
                      selectedOrderRequest.estado === 'APROBADO',
                    'bg-red-100 text-red-800':
                      selectedOrderRequest.estado === 'RECHAZADO',
                    'bg-blue-100 text-blue-800':
                      selectedOrderRequest.estado === 'ENTREGADO',
                    'bg-gray-100 text-gray-800':
                      selectedOrderRequest.estado === 'CANCELADO',
                  }"
                >
                  {{ selectedOrderRequest.estado }}
                </span>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500 mb-2">
                Funcionario Autorizado
              </p>
              <p class="text-sm text-gray-900">
                {{ selectedOrderRequest.funcionarioAutorizado }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500 mb-2">
                Productos Solicitados
              </p>
              <div class="border rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        N° Orden
                      </th>
                      <th
                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        Descripción
                      </th>
                      <th
                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        Cantidad
                      </th>
                      <th
                        class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        Observaciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let producto of selectedOrderRequest.productos">
                      <td class="px-4 py-2 text-sm text-gray-900">
                        {{ producto.numeroOrden }}
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-900">
                        {{ producto.descripcion }}
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-900">
                        {{ producto.cantidadSolicitada }}
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-500">
                        {{ producto.observaciones || "-" }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrderRequestListComponent implements OnInit {
  orderRequests$: Observable<OrderRequest[]>;
  selectedOrderRequest: OrderRequest | null = null;

  constructor(private orderRequestService: OrderRequestService) {
    this.orderRequests$ = this.orderRequestService.getOrderRequests();
  }

  ngOnInit() {}

  getPendingCount(): number {
    // In a real app, you'd compute this from the observable
    return 1; // Demo value
  }

  getApprovedCount(): number {
    return 0; // Demo value
  }

  getDeliveredCount(): number {
    return 0; // Demo value
  }

  viewOrderRequest(orderRequest: OrderRequest) {
    this.selectedOrderRequest = orderRequest;
  }

  closeModal() {
    this.selectedOrderRequest = null;
  }

  deleteOrderRequest(orderRequest: OrderRequest) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar la solicitud "${orderRequest.numeroPedido}"?`,
      )
    ) {
      this.orderRequestService.deleteOrderRequest(orderRequest.id!).subscribe({
        next: () => {
          console.log("Solicitud eliminada exitosamente");
        },
        error: (error) => {
          console.error("Error al eliminar solicitud:", error);
          alert("Error al eliminar la solicitud. Intenta de nuevo.");
        },
      });
    }
  }
}
