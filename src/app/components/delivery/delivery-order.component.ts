import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DeliveryService } from "../../services/delivery.service";
import { OrderRequestService } from "../../services/order-request.service";
import { InvoiceService } from "../../services/invoice.service";
import { DeliveryFormData, DeliveryProduct } from "../../models/invoice.model";
import { OrderRequest } from "../../models/order-request.model";

@Component({
  selector: "app-delivery-order",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Salida de Pedido</h1>
          <p class="text-gray-600 mt-2">
            Procese la entrega de productos a funcionarios autorizados
          </p>
        </div>
        <div class="flex space-x-3">
          <a
            routerLink="/entregas"
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <span>Ver Entregas</span>
          </a>
        </div>
      </div>

      <!-- Formulario -->
      <form
        [formGroup]="deliveryForm"
        (ngSubmit)="onSubmit()"
        class="space-y-8"
      >
        <!-- Selección de Solicitud -->
        <div class="card p-8">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"
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
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Solicitud de Pedido
              </h2>
              <p class="text-gray-600">
                Seleccione la solicitud que será entregada
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="solicitudPedidoId"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Solicitud de Pedido *
              </label>
              <select
                id="solicitudPedidoId"
                formControlName="solicitudPedidoId"
                class="input"
                (change)="onOrderRequestChange($event)"
                [class.border-red-500]="
                  deliveryForm.get('solicitudPedidoId')?.invalid &&
                  deliveryForm.get('solicitudPedidoId')?.touched
                "
              >
                <option value="">Seleccione una solicitud</option>
                <option
                  *ngFor="let request of approvedOrderRequests$ | async"
                  [value]="request.id"
                >
                  {{ request.numeroPedido }} - {{ request.dependencia }}
                </option>
              </select>
              <div
                *ngIf="
                  deliveryForm.get('solicitudPedidoId')?.invalid &&
                  deliveryForm.get('solicitudPedidoId')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                Debe seleccionar una solicitud de pedido
              </div>
            </div>

            <div *ngIf="selectedOrderRequest">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Funcionario Autorizado
              </label>
              <input
                type="text"
                [value]="selectedOrderRequest.funcionarioAutorizado"
                class="input bg-gray-50"
                readonly
              />
              <p class="mt-1 text-sm text-gray-500">
                Solo esta persona puede retirar los productos
              </p>
            </div>
          </div>

          <!-- Información de la solicitud seleccionada -->
          <div
            *ngIf="selectedOrderRequest"
            class="mt-6 p-4 bg-blue-50 rounded-lg"
          >
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              Información de la Solicitud:
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Número:</span>
                <span class="ml-2 font-medium">{{
                  selectedOrderRequest.numeroPedido
                }}</span>
              </div>
              <div>
                <span class="text-gray-600">Dependencia:</span>
                <span class="ml-2 font-medium">{{
                  selectedOrderRequest.dependencia
                }}</span>
              </div>
              <div>
                <span class="text-gray-600">Fecha Solicitud:</span>
                <span class="ml-2 font-medium">{{
                  selectedOrderRequest.fecha | date: "dd/MM/yyyy"
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Información de Entrega -->
        <div class="card p-8">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Información de Entrega
              </h2>
              <p class="text-gray-600">Datos de la entrega y responsables</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                for="fechaEntrega"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha de Entrega *
              </label>
              <input
                id="fechaEntrega"
                type="datetime-local"
                formControlName="fechaEntrega"
                class="input"
                [class.border-red-500]="
                  deliveryForm.get('fechaEntrega')?.invalid &&
                  deliveryForm.get('fechaEntrega')?.touched
                "
              />
              <div
                *ngIf="
                  deliveryForm.get('fechaEntrega')?.invalid &&
                  deliveryForm.get('fechaEntrega')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La fecha de entrega es requerida
              </div>
            </div>

            <div>
              <label
                for="funcionarioAutorizado"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Funcionario Autorizado *
              </label>
              <input
                id="funcionarioAutorizado"
                type="text"
                formControlName="funcionarioAutorizado"
                class="input"
                placeholder="Nombre del funcionario que retira"
                [class.border-red-500]="
                  deliveryForm.get('funcionarioAutorizado')?.invalid &&
                  deliveryForm.get('funcionarioAutorizado')?.touched
                "
              />
              <div
                *ngIf="
                  deliveryForm.get('funcionarioAutorizado')?.invalid &&
                  deliveryForm.get('funcionarioAutorizado')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                El funcionario autorizado es requerido
              </div>
            </div>

            <div>
              <label
                for="funcionarioEntrega"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Funcionario que Entrega *
              </label>
              <input
                id="funcionarioEntrega"
                type="text"
                formControlName="funcionarioEntrega"
                class="input"
                placeholder="Nombre del funcionario que entrega"
                [class.border-red-500]="
                  deliveryForm.get('funcionarioEntrega')?.invalid &&
                  deliveryForm.get('funcionarioEntrega')?.touched
                "
              />
              <div
                *ngIf="
                  deliveryForm.get('funcionarioEntrega')?.invalid &&
                  deliveryForm.get('funcionarioEntrega')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                El funcionario que entrega es requerido
              </div>
            </div>
          </div>
        </div>

        <!-- Productos a Entregar -->
        <div class="card p-8" *ngIf="selectedOrderRequest">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4"
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Productos a Entregar
              </h2>
              <p class="text-gray-600">
                Confirme las cantidades entregadas de cada producto
              </p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table">
              <thead class="bg-gray-50">
                <tr>
                  <th>Producto</th>
                  <th class="w-32">Cant. Solicitada</th>
                  <th class="w-32">Cant. Entregada</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody formArrayName="productos">
                <tr
                  *ngFor="let product of productosArray.controls; let i = index"
                  [formGroupName]="i"
                >
                  <td>
                    <div class="text-sm font-medium text-gray-900">
                      {{ selectedOrderRequest.productos[i].descripcion }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Orden:
                      {{ selectedOrderRequest.productos[i].numeroOrden }}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      formControlName="cantidadSolicitada"
                      class="input py-2 bg-gray-50"
                      readonly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      formControlName="cantidadEntregada"
                      class="input py-2"
                      placeholder="0"
                      [max]="product.get('cantidadSolicitada')?.value"
                    />
                  </td>
                  <td>
                    <textarea
                      formControlName="observaciones"
                      rows="2"
                      class="input py-2 resize-none"
                      placeholder="Observaciones de la entrega..."
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resumen de entrega -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Solicitado:</span>
                <span class="font-medium">{{ getTotalSolicitado() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Entregado:</span>
                <span class="font-medium text-primary-600">{{
                  getTotalEntregado()
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Estado de Entrega:</span>
                <span
                  class="font-medium"
                  [ngClass]="{
                    'text-green-600': getDeliveryStatus() === 'Completa',
                    'text-yellow-600': getDeliveryStatus() === 'Parcial',
                    'text-red-600': getDeliveryStatus() === 'Pendiente',
                  }"
                >
                  {{ getDeliveryStatus() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Firma Digital -->
        <div class="card p-8">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4"
            >
              <svg
                class="w-6 h-6 text-orange-600"
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
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Firma Digital (Opcional)
              </h2>
              <p class="text-gray-600">
                El funcionario puede firmar digitalmente la recepción
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Área de Firma
              </label>
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50"
              >
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
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
                <p class="mt-2 text-sm text-gray-500">
                  Funcionalidad de firma digital será implementada aquí
                </p>
                <p class="text-xs text-gray-400">
                  Por ahora, la entrega se procesa sin firma digital
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="card p-8">
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4"
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
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                ></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Observaciones</h2>
              <p class="text-gray-600">
                Comentarios adicionales sobre la entrega
              </p>
            </div>
          </div>

          <div>
            <textarea
              formControlName="observaciones"
              rows="4"
              class="input"
              placeholder="Agregue cualquier observación sobre la entrega de estos productos..."
            ></textarea>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button type="button" (click)="resetForm()" class="btn btn-secondary">
            Limpiar Formulario
          </button>
          <button
            type="submit"
            class="btn btn-primary flex items-center space-x-2"
            [disabled]="deliveryForm.invalid || isSubmitting"
          >
            <svg
              *ngIf="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{
              isSubmitting ? "Procesando Entrega..." : "Procesar Entrega"
            }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class DeliveryOrderComponent implements OnInit {
  deliveryForm: FormGroup;
  isSubmitting = false;
  selectedOrderRequest: OrderRequest | null = null;
  approvedOrderRequests$: Observable<OrderRequest[]>;

  constructor(
    private formBuilder: FormBuilder,
    private deliveryService: DeliveryService,
    private orderRequestService: OrderRequestService,
    private invoiceService: InvoiceService,
    private router: Router,
  ) {
    this.deliveryForm = this.createForm();
    this.approvedOrderRequests$ = this.orderRequestService
      .getOrderRequests()
      .pipe(
        map((requests) =>
          requests.filter(
            (r) => r.estado === "APROBADO" || r.estado === "PENDIENTE",
          ),
        ),
      );
  }

  ngOnInit() {
    // Set current datetime as default
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.deliveryForm.patchValue({
      fechaEntrega: now.toISOString().slice(0, 16),
    });
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      solicitudPedidoId: ["", [Validators.required]],
      fechaEntrega: ["", [Validators.required]],
      funcionarioAutorizado: ["", [Validators.required]],
      funcionarioEntrega: ["", [Validators.required]],
      productos: this.formBuilder.array([]),
      observaciones: [""],
      firmaDigital: [""],
    });
  }

  get productosArray(): FormArray {
    return this.deliveryForm.get("productos") as FormArray;
  }

  private createProductFormGroup(
    productId: string,
    descripcion: string,
    cantidadSolicitada: number,
  ): FormGroup {
    return this.formBuilder.group({
      productoId: [productId],
      descripcion: [descripcion],
      cantidadSolicitada: [cantidadSolicitada],
      cantidadEntregada: [cantidadSolicitada, [Validators.min(0)]],
      observaciones: [""],
    });
  }

  onOrderRequestChange(event: any): void {
    const orderRequestId = event.target.value;
    if (!orderRequestId) {
      this.selectedOrderRequest = null;
      this.productosArray.clear();
      return;
    }

    this.orderRequestService.getOrderRequest(orderRequestId).subscribe({
      next: (orderRequest) => {
        if (orderRequest) {
          this.selectedOrderRequest = orderRequest;
          this.deliveryForm.patchValue({
            funcionarioAutorizado: orderRequest.funcionarioAutorizado,
          });

          // Clear and rebuild products array
          this.productosArray.clear();
          orderRequest.productos.forEach((product) => {
            const productFormGroup = this.createProductFormGroup(
              product.id || "",
              product.descripcion,
              product.cantidadSolicitada,
            );
            this.productosArray.push(productFormGroup);
          });
        }
      },
      error: (error) => {
        console.error("Error loading order request:", error);
        alert("Error al cargar la solicitud de pedido");
      },
    });
  }

  getTotalSolicitado(): number {
    return this.productosArray.controls.reduce((total, control) => {
      return total + (control.get("cantidadSolicitada")?.value || 0);
    }, 0);
  }

  getTotalEntregado(): number {
    return this.productosArray.controls.reduce((total, control) => {
      return total + (control.get("cantidadEntregada")?.value || 0);
    }, 0);
  }

  getDeliveryStatus(): string {
    const totalSolicitado = this.getTotalSolicitado();
    const totalEntregado = this.getTotalEntregado();

    if (totalEntregado === 0) return "Pendiente";
    if (totalEntregado === totalSolicitado) return "Completa";
    return "Parcial";
  }

  resetForm(): void {
    this.deliveryForm.reset();
    this.productosArray.clear();
    this.selectedOrderRequest = null;

    // Reset default datetime
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.deliveryForm.patchValue({
      fechaEntrega: now.toISOString().slice(0, 16),
    });
  }

  onSubmit(): void {
    if (this.deliveryForm.valid && this.productosArray.length > 0) {
      this.isSubmitting = true;

      const formData: DeliveryFormData = {
        solicitudPedidoId: this.deliveryForm.value.solicitudPedidoId,
        fechaEntrega: this.deliveryForm.value.fechaEntrega,
        funcionarioAutorizado: this.deliveryForm.value.funcionarioAutorizado,
        funcionarioEntrega: this.deliveryForm.value.funcionarioEntrega,
        productos: this.deliveryForm.value.productos,
        observaciones: this.deliveryForm.value.observaciones,
        firmaDigital: this.deliveryForm.value.firmaDigital,
      };

      this.deliveryService.createDelivery(formData).subscribe({
        next: (delivery) => {
          alert("Entrega procesada exitosamente");
          console.log("Delivery created:", delivery);
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error("Error creating delivery:", error);
          alert("Error al procesar la entrega. Intenta de nuevo.");
          this.isSubmitting = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.deliveryForm.controls).forEach((key) => {
        const control = this.deliveryForm.get(key);
        control?.markAsTouched();
      });

      if (!this.selectedOrderRequest) {
        alert("Debe seleccionar una solicitud de pedido");
      } else if (this.productosArray.length === 0) {
        alert("No hay productos para entregar");
      }
    }
  }
}
