import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { OrderRequestService } from "../../services/order-request.service";
import {
  OrderRequest,
  OrderRequestFormData,
  OrderRequestProduct,
} from "../../models/order-request.model";

@Component({
  selector: "app-order-request-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditing ? "Editar Solicitud" : "Nueva Solicitud de Pedido" }}
          </h1>
          <p class="text-gray-600">
            {{
              isEditing
                ? "Modifica los datos de la solicitud"
                : "Completa el formulario para crear una nueva solicitud de pedido"
            }}
          </p>
        </div>
        <a
          routerLink="/solicitudes"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          <span>Volver</span>
        </a>
      </div>

      <!-- Formulario -->
      <form
        [formGroup]="orderRequestForm"
        (ngSubmit)="onSubmit()"
        class="space-y-8"
      >
        <!-- Información General -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">
            Información General
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                for="fecha"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha *
              </label>
              <input
                id="fecha"
                type="date"
                formControlName="fecha"
                class="input"
                [class.border-red-500]="
                  orderRequestForm.get('fecha')?.invalid &&
                  orderRequestForm.get('fecha')?.touched
                "
              />
              <div
                *ngIf="
                  orderRequestForm.get('fecha')?.invalid &&
                  orderRequestForm.get('fecha')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La fecha es requerida
              </div>
            </div>

            <div>
              <label
                for="numeroPedido"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Pedido *
              </label>
              <div class="flex space-x-2">
                <input
                  id="numeroPedido"
                  type="text"
                  formControlName="numeroPedido"
                  class="input flex-1"
                  placeholder="PED-2024-001"
                  [class.border-red-500]="
                    orderRequestForm.get('numeroPedido')?.invalid &&
                    orderRequestForm.get('numeroPedido')?.touched
                  "
                />
                <button
                  type="button"
                  (click)="generateOrderNumber()"
                  class="btn btn-secondary px-3"
                  title="Generar número automático"
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
                </button>
              </div>
              <div
                *ngIf="
                  orderRequestForm.get('numeroPedido')?.invalid &&
                  orderRequestForm.get('numeroPedido')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                El número de pedido es requerido
              </div>
            </div>

            <div>
              <label
                for="dependencia"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Dependencia *
              </label>
              <select
                id="dependencia"
                formControlName="dependencia"
                class="input"
                [class.border-red-500]="
                  orderRequestForm.get('dependencia')?.invalid &&
                  orderRequestForm.get('dependencia')?.touched
                "
              >
                <option value="">Seleccione una dependencia</option>
                <option value="Almacén Central">Almacén Central</option>
                <option value="Oficina Administrativa">
                  Oficina Administrativa
                </option>
                <option value="Departamento de Sistemas">
                  Departamento de Sistemas
                </option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Contabilidad">Contabilidad</option>
                <option value="Gerencia General">Gerencia General</option>
                <option value="Ventas">Ventas</option>
                <option value="Marketing">Marketing</option>
                <option value="Producción">Producción</option>
              </select>
              <div
                *ngIf="
                  orderRequestForm.get('dependencia')?.invalid &&
                  orderRequestForm.get('dependencia')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La dependencia es requerida
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Productos -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium text-gray-900">
                Productos Solicitados
              </h2>
              <button
                type="button"
                (click)="addProduct()"
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
                <span>Agregar Producto</span>
              </button>
            </div>
          </div>

          <div class="p-6">
            <div
              *ngIf="productos.length === 0"
              class="text-center py-12 text-gray-500"
            >
              <svg
                class="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <p class="text-lg font-medium">No hay productos agregados</p>
              <p class="text-sm">
                Haz clic en "Agregar Producto" para comenzar
              </p>
            </div>

            <!-- Tabla de productos -->
            <div *ngIf="productos.length > 0" class="overflow-x-auto">
              <table class="table">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="w-24">N° Orden</th>
                    <th>Descripción</th>
                    <th class="w-32">Cantidad</th>
                    <th>Observaciones</th>
                    <th class="w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let producto of productos.controls; let i = index"
                    [formGroupName]="i"
                  >
                    <td>
                      <input
                        type="text"
                        formControlName="numeroOrden"
                        class="input text-center"
                        placeholder="001"
                        [class.border-red-500]="
                          producto.get('numeroOrden')?.invalid &&
                          producto.get('numeroOrden')?.touched
                        "
                      />
                      <div
                        *ngIf="
                          producto.get('numeroOrden')?.invalid &&
                          producto.get('numeroOrden')?.touched
                        "
                        class="mt-1 text-xs text-red-600"
                      >
                        Requerido
                      </div>
                    </td>
                    <td>
                      <textarea
                        formControlName="descripcion"
                        rows="2"
                        class="input"
                        placeholder="Descripción del producto"
                        [class.border-red-500]="
                          producto.get('descripcion')?.invalid &&
                          producto.get('descripcion')?.touched
                        "
                      ></textarea>
                      <div
                        *ngIf="
                          producto.get('descripcion')?.invalid &&
                          producto.get('descripcion')?.touched
                        "
                        class="mt-1 text-xs text-red-600"
                      >
                        Requerido
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        formControlName="cantidadSolicitada"
                        class="input text-center"
                        placeholder="1"
                        [class.border-red-500]="
                          producto.get('cantidadSolicitada')?.invalid &&
                          producto.get('cantidadSolicitada')?.touched
                        "
                      />
                      <div
                        *ngIf="
                          producto.get('cantidadSolicitada')?.invalid &&
                          producto.get('cantidadSolicitada')?.touched
                        "
                        class="mt-1 text-xs text-red-600"
                      >
                        <span
                          *ngIf="
                            producto.get('cantidadSolicitada')?.errors?.[
                              'required'
                            ]
                          "
                          >Requerido</span
                        >
                        <span
                          *ngIf="
                            producto.get('cantidadSolicitada')?.errors?.['min']
                          "
                          >Mínimo 1</span
                        >
                      </div>
                    </td>
                    <td>
                      <textarea
                        formControlName="observaciones"
                        rows="2"
                        class="input"
                        placeholder="Observaciones adicionales"
                      ></textarea>
                    </td>
                    <td>
                      <button
                        type="button"
                        (click)="removeProduct(i)"
                        class="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar producto"
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
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Funcionario Autorizado -->
        <div class="card p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-6">
            Funcionario Autorizado
          </h2>
          <div class="max-w-md">
            <label
              for="funcionarioAutorizado"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Nombre y Apellido del Funcionario Autorizado a Retirar *
            </label>
            <input
              id="funcionarioAutorizado"
              type="text"
              formControlName="funcionarioAutorizado"
              class="input"
              placeholder="Nombre completo del funcionario"
              [class.border-red-500]="
                orderRequestForm.get('funcionarioAutorizado')?.invalid &&
                orderRequestForm.get('funcionarioAutorizado')?.touched
              "
            />
            <div
              *ngIf="
                orderRequestForm.get('funcionarioAutorizado')?.invalid &&
                orderRequestForm.get('funcionarioAutorizado')?.touched
              "
              class="mt-1 text-sm text-red-600"
            >
              El nombre del funcionario autorizado es requerido
            </div>
            <p class="mt-2 text-sm text-gray-500">
              Esta persona será la única autorizada para retirar los productos
              solicitados
            </p>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <a routerLink="/solicitudes" class="btn btn-secondary"> Cancelar </a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="orderRequestForm.invalid || isSubmitting"
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
              isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Guardando..."
                : isEditing
                  ? "Actualizar Solicitud"
                  : "Crear Solicitud"
            }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class OrderRequestFormComponent implements OnInit {
  orderRequestForm: FormGroup;
  isEditing = false;
  orderRequestId: string | null = null;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private orderRequestService: OrderRequestService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.orderRequestForm = this.createForm();
  }

  ngOnInit() {
    this.orderRequestId = this.route.snapshot.paramMap.get("id");
    this.isEditing = !!this.orderRequestId;

    // Set default date to today
    if (!this.isEditing) {
      const today = new Date().toISOString().split("T")[0];
      this.orderRequestForm.patchValue({ fecha: today });
      this.generateOrderNumber();
    }

    if (this.isEditing && this.orderRequestId) {
      this.loadOrderRequest(this.orderRequestId);
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      fecha: ["", [Validators.required]],
      numeroPedido: ["", [Validators.required]],
      dependencia: ["", [Validators.required]],
      productos: this.formBuilder.array([]),
      funcionarioAutorizado: ["", [Validators.required]],
    });
  }

  get productos(): FormArray {
    return this.orderRequestForm.get("productos") as FormArray;
  }

  private createProductForm(
    product: Partial<OrderRequestProduct> = {},
  ): FormGroup {
    return this.formBuilder.group({
      numeroOrden: [product.numeroOrden || "", [Validators.required]],
      descripcion: [product.descripcion || "", [Validators.required]],
      cantidadSolicitada: [
        product.cantidadSolicitada || 1,
        [Validators.required, Validators.min(1)],
      ],
      observaciones: [product.observaciones || ""],
    });
  }

  addProduct() {
    const nextOrderNumber = String(this.productos.length + 1).padStart(3, "0");
    const productForm = this.createProductForm({
      numeroOrden: nextOrderNumber,
    });
    this.productos.push(productForm);
  }

  removeProduct(index: number) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      this.productos.removeAt(index);
      // Renumber the remaining products
      this.renumberProducts();
    }
  }

  private renumberProducts() {
    this.productos.controls.forEach((control, index) => {
      const orderNumber = String(index + 1).padStart(3, "0");
      control.get("numeroOrden")?.setValue(orderNumber);
    });
  }

  generateOrderNumber() {
    const orderNumber = this.orderRequestService.generateOrderNumber();
    this.orderRequestForm.patchValue({ numeroPedido: orderNumber });
  }

  private loadOrderRequest(id: string) {
    this.orderRequestService.getOrderRequest(id).subscribe({
      next: (orderRequest) => {
        if (orderRequest) {
          this.orderRequestForm.patchValue({
            fecha: orderRequest.fecha.toISOString().split("T")[0],
            numeroPedido: orderRequest.numeroPedido,
            dependencia: orderRequest.dependencia,
            funcionarioAutorizado: orderRequest.funcionarioAutorizado,
          });

          // Clear existing products
          while (this.productos.length !== 0) {
            this.productos.removeAt(0);
          }

          // Add loaded products
          orderRequest.productos.forEach((product) => {
            const productForm = this.createProductForm(product);
            this.productos.push(productForm);
          });
        }
      },
      error: (error) => {
        console.error("Error al cargar solicitud:", error);
        alert("Error al cargar la solicitud. Regresando a la lista.");
        this.router.navigate(["/solicitudes"]);
      },
    });
  }

  onSubmit() {
    if (this.orderRequestForm.valid) {
      if (this.productos.length === 0) {
        alert("Debe agregar al menos un producto a la solicitud.");
        return;
      }

      this.isSubmitting = true;
      const formData: OrderRequestFormData = this.orderRequestForm.value;

      const operation = this.isEditing
        ? this.orderRequestService.updateOrderRequest(
            this.orderRequestId!,
            formData,
          )
        : this.orderRequestService.createOrderRequest(formData);

      operation.subscribe({
        next: () => {
          const message = this.isEditing
            ? "Solicitud actualizada exitosamente"
            : "Solicitud creada exitosamente";
          alert(message);
          this.router.navigate(["/solicitudes"]);
        },
        error: (error) => {
          console.error("Error al guardar solicitud:", error);
          alert("Error al guardar la solicitud. Intenta de nuevo.");
          this.isSubmitting = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.orderRequestForm.controls).forEach((key) => {
        const control = this.orderRequestForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });

      // Also mark products as touched
      this.productos.controls.forEach((productControl) => {
        const formGroup = productControl as FormGroup;
        Object.keys(formGroup.controls).forEach((key) => {
          const control = formGroup.get(key);
          if (control?.invalid) {
            control.markAsTouched();
          }
        });
      });
    }
  }
}
