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

import { InvoiceService } from "../../services/invoice.service";
import { OrderRequestService } from "../../services/order-request.service";
import {
  InvoiceFormData,
  InvoiceProduct,
  InvoiceDocument,
} from "../../models/invoice.model";
import { OrderRequest } from "../../models/order-request.model";

@Component({
  selector: "app-invoice-register",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Registro de Factura</h1>
          <p class="text-gray-600 mt-2">
            Registre una nueva factura y sus productos asociados
          </p>
        </div>
        <div class="flex space-x-3">
          <a
            routerLink="/facturas"
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
            <span>Ver Facturas</span>
          </a>
        </div>
      </div>

      <!-- Formulario -->
      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- Información de la Factura -->
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
                Información de la Factura
              </h2>
              <p class="text-gray-600">Datos básicos de la factura</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                for="numeroFactura"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Factura *
              </label>
              <div class="flex">
                <input
                  id="numeroFactura"
                  type="text"
                  formControlName="numeroFactura"
                  class="input rounded-r-none"
                  placeholder="FAC-2024-001"
                  [class.border-red-500]="
                    invoiceForm.get('numeroFactura')?.invalid &&
                    invoiceForm.get('numeroFactura')?.touched
                  "
                />
                <button
                  type="button"
                  (click)="generateInvoiceNumber()"
                  class="btn btn-secondary rounded-l-none border-l-0 px-3"
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
                  invoiceForm.get('numeroFactura')?.invalid &&
                  invoiceForm.get('numeroFactura')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                El número de factura es requerido
              </div>
            </div>

            <div>
              <label
                for="fecha"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha de Factura *
              </label>
              <input
                id="fecha"
                type="date"
                formControlName="fecha"
                class="input"
                [class.border-red-500]="
                  invoiceForm.get('fecha')?.invalid &&
                  invoiceForm.get('fecha')?.touched
                "
              />
              <div
                *ngIf="
                  invoiceForm.get('fecha')?.invalid &&
                  invoiceForm.get('fecha')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La fecha es requerida
              </div>
            </div>

            <div>
              <label
                for="proveedor"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Proveedor *
              </label>
              <input
                id="proveedor"
                type="text"
                formControlName="proveedor"
                class="input"
                placeholder="Nombre del proveedor"
                [class.border-red-500]="
                  invoiceForm.get('proveedor')?.invalid &&
                  invoiceForm.get('proveedor')?.touched
                "
              />
              <div
                *ngIf="
                  invoiceForm.get('proveedor')?.invalid &&
                  invoiceForm.get('proveedor')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                El proveedor es requerido
              </div>
            </div>

            <div>
              <label
                for="solicitudPedidoId"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Solicitud de Pedido (Opcional)
              </label>
              <select
                id="solicitudPedidoId"
                formControlName="solicitudPedidoId"
                class="input"
              >
                <option value="">Seleccione una solicitud</option>
                <option
                  *ngFor="let request of orderRequests$ | async"
                  [value]="request.id"
                >
                  {{ request.numeroPedido }} - {{ request.dependencia }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Productos de la Factura -->
        <div class="card p-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  ></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  Productos de la Factura
                </h2>
                <p class="text-gray-600">
                  Lista de productos incluidos en la factura
                </p>
              </div>
            </div>
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

          <!-- Tabla de productos -->
          <div class="overflow-x-auto">
            <table class="table">
              <thead class="bg-gray-50">
                <tr>
                  <th>Descripción</th>
                  <th class="w-24">Cantidad</th>
                  <th class="w-32">Precio Unitario</th>
                  <th class="w-32">Subtotal</th>
                  <th class="w-24">Acciones</th>
                </tr>
              </thead>
              <tbody formArrayName="productos">
                <tr
                  *ngIf="productosArray.length === 0"
                  class="hover:bg-transparent"
                >
                  <td
                    colspan="5"
                    class="text-center py-8 text-gray-500 hover:bg-transparent"
                  >
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
                      <p class="font-medium">No hay productos agregados</p>
                      <p class="text-sm">
                        Haga clic en "Agregar Producto" para comenzar
                      </p>
                    </div>
                  </td>
                </tr>
                <tr
                  *ngFor="let product of productosArray.controls; let i = index"
                  [formGroupName]="i"
                >
                  <td>
                    <textarea
                      formControlName="descripcion"
                      rows="2"
                      class="input py-2 resize-none"
                      placeholder="Descripción del producto..."
                    ></textarea>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      formControlName="cantidad"
                      class="input py-2"
                      placeholder="1"
                      (input)="calculateSubtotal(i)"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="precioUnitario"
                      class="input py-2"
                      placeholder="0.00"
                      (input)="calculateSubtotal(i)"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      formControlName="subtotal"
                      class="input py-2 bg-gray-50"
                      readonly
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      (click)="removeProduct(i)"
                      class="text-red-600 hover:text-red-800 p-2"
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

          <!-- Resumen -->
          <div
            *ngIf="productosArray.length > 0"
            class="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex justify-between items-center text-lg font-bold">
              <span>Monto Total:</span>
              <span class="text-primary-600"
                >\${{ calculateTotal() | number: "1.2-2" }}</span
              >
            </div>
            <div class="mt-2 text-sm text-gray-600">
              {{ productosArray.length }} producto{{
                productosArray.length !== 1 ? "s" : ""
              }}
              en la factura
            </div>
          </div>
        </div>

        <!-- Documentos -->
        <div class="card p-8">
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                ></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Documentos de la Factura
              </h2>
              <p class="text-gray-600">
                Suba imágenes o PDFs de la factura original
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Subir Documentos
              </label>
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              >
                <input
                  type="file"
                  #fileInput
                  (change)="onFileSelected($event)"
                  multiple
                  accept="image/*,.pdf"
                  class="hidden"
                />
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div class="mt-4">
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    class="btn btn-secondary"
                  >
                    Seleccionar Archivos
                  </button>
                  <p class="mt-2 text-sm text-gray-500">
                    PNG, JPG, PDF hasta 10MB cada uno
                  </p>
                </div>
              </div>
            </div>

            <!-- Lista de documentos subidos -->
            <div *ngIf="uploadedDocuments.length > 0" class="space-y-2">
              <h4 class="text-sm font-medium text-gray-700">
                Documentos Subidos:
              </h4>
              <div
                *ngFor="let doc of uploadedDocuments; let i = index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <svg
                    class="w-5 h-5 text-gray-500"
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
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ doc.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ doc.size / 1024 / 1024 | number: "1.2-2" }} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="removeDocument(i)"
                  class="text-red-600 hover:text-red-800"
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notas -->
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
              <h2 class="text-xl font-bold text-gray-900">Notas Adicionales</h2>
              <p class="text-gray-600">
                Información adicional sobre la factura
              </p>
            </div>
          </div>

          <div>
            <textarea
              formControlName="notas"
              rows="4"
              class="input"
              placeholder="Agregue cualquier nota o comentario adicional sobre esta factura..."
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
            [disabled]="invoiceForm.invalid || isSubmitting"
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
              isSubmitting ? "Registrando Factura..." : "Registrar Factura"
            }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class InvoiceRegisterComponent implements OnInit {
  invoiceForm: FormGroup;
  isSubmitting = false;
  uploadedDocuments: File[] = [];
  orderRequests$: Observable<OrderRequest[]>;

  constructor(
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private orderRequestService: OrderRequestService,
    private router: Router,
  ) {
    this.invoiceForm = this.createForm();
    this.orderRequests$ = this.orderRequestService.getOrderRequests();
  }

  ngOnInit() {
    // Set today's date as default
    const today = new Date().toISOString().split("T")[0];
    this.invoiceForm.patchValue({ fecha: today });

    // Generate initial invoice number
    this.generateInvoiceNumber();

    // Add one initial product
    this.addProduct();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      numeroFactura: ["", [Validators.required]],
      fecha: ["", [Validators.required]],
      proveedor: ["", [Validators.required]],
      solicitudPedidoId: [""],
      productos: this.formBuilder.array([]),
      notas: [""],
    });
  }

  get productosArray(): FormArray {
    return this.invoiceForm.get("productos") as FormArray;
  }

  private createProductFormGroup(): FormGroup {
    return this.formBuilder.group({
      descripcion: ["", [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0],
    });
  }

  addProduct(): void {
    this.productosArray.push(this.createProductFormGroup());
  }

  removeProduct(index: number): void {
    this.productosArray.removeAt(index);
  }

  calculateSubtotal(index: number): void {
    const productControl = this.productosArray.at(index);
    const cantidad = productControl.get("cantidad")?.value || 0;
    const precioUnitario = productControl.get("precioUnitario")?.value || 0;
    const subtotal = cantidad * precioUnitario;

    productControl.get("subtotal")?.setValue(subtotal);
  }

  calculateTotal(): number {
    return this.productosArray.controls.reduce((total, control) => {
      const subtotal = control.get("subtotal")?.value || 0;
      return total + subtotal;
    }, 0);
  }

  generateInvoiceNumber(): void {
    const invoiceNumber = this.invoiceService.generateInvoiceNumber();
    this.invoiceForm.patchValue({ numeroFactura: invoiceNumber });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 10 * 1024 * 1024) {
        // 10MB limit
        this.uploadedDocuments.push(file);
      } else {
        alert(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
      }
    }
  }

  removeDocument(index: number): void {
    this.uploadedDocuments.splice(index, 1);
  }

  resetForm(): void {
    this.invoiceForm.reset();
    this.productosArray.clear();
    this.uploadedDocuments = [];

    // Reset default values
    const today = new Date().toISOString().split("T")[0];
    this.invoiceForm.patchValue({ fecha: today });
    this.generateInvoiceNumber();
    this.addProduct();
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.productosArray.length > 0) {
      this.isSubmitting = true;

      // Calculate total
      const montoTotal = this.calculateTotal();

      const formData: InvoiceFormData = {
        ...this.invoiceForm.value,
        montoTotal,
      };

      this.invoiceService.createInvoice(formData).subscribe({
        next: (invoice) => {
          alert("Factura registrada exitosamente");
          console.log("Invoice created:", invoice);

          // Upload documents if any
          if (this.uploadedDocuments.length > 0 && invoice.id) {
            this.uploadDocuments(invoice.id);
          } else {
            this.resetForm();
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error("Error creating invoice:", error);
          alert("Error al registrar la factura. Intenta de nuevo.");
          this.isSubmitting = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.invoiceForm.controls).forEach((key) => {
        const control = this.invoiceForm.get(key);
        control?.markAsTouched();
      });

      // Mark all product form controls as touched
      this.productosArray.controls.forEach((productControl) => {
        Object.keys((productControl as any).controls).forEach((key) => {
          productControl.get(key)?.markAsTouched();
        });
      });

      if (this.productosArray.length === 0) {
        alert("Debe agregar al menos un producto a la factura");
      }
    }
  }

  private uploadDocuments(invoiceId: string): void {
    let uploadedCount = 0;
    const totalDocuments = this.uploadedDocuments.length;

    this.uploadedDocuments.forEach((document) => {
      this.invoiceService.uploadDocument(invoiceId, document).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount === totalDocuments) {
            console.log("All documents uploaded successfully");
            this.resetForm();
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error("Error uploading document:", error);
          uploadedCount++;
          if (uploadedCount === totalDocuments) {
            this.resetForm();
            this.isSubmitting = false;
          }
        },
      });
    });
  }
}
