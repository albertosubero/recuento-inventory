import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";

import { ProductService } from "../../services/product.service";
import {
  Product,
  ProductFormData,
  ProductStatus,
} from "../../models/product.model";

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditing ? "Editar Producto" : "Nuevo Producto" }}
          </h1>
          <p class="text-gray-600">
            {{
              isEditing
                ? "Modifica los datos del producto"
                : "Agrega un nuevo producto al inventario"
            }}
          </p>
        </div>
        <a
          routerLink="/productos"
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
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Información básica -->
          <div class="lg:col-span-2 space-y-6">
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información Básica
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label
                    for="nombre"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre del Producto *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    formControlName="nombre"
                    class="input"
                    placeholder="Ingrese el nombre del producto"
                    [class.border-red-500]="
                      productForm.get('nombre')?.invalid &&
                      productForm.get('nombre')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('nombre')?.invalid &&
                      productForm.get('nombre')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El nombre del producto es requerido
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label
                    for="descripcion"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Descripción *
                  </label>
                  <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="3"
                    class="input"
                    placeholder="Descripción detallada del producto"
                    [class.border-red-500]="
                      productForm.get('descripcion')?.invalid &&
                      productForm.get('descripcion')?.touched
                    "
                  ></textarea>
                  <div
                    *ngIf="
                      productForm.get('descripcion')?.invalid &&
                      productForm.get('descripcion')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    La descripción es requerida
                  </div>
                </div>

                <div>
                  <label
                    for="marca"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Marca *
                  </label>
                  <input
                    id="marca"
                    type="text"
                    formControlName="marca"
                    class="input"
                    placeholder="Marca del producto"
                    [class.border-red-500]="
                      productForm.get('marca')?.invalid &&
                      productForm.get('marca')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('marca')?.invalid &&
                      productForm.get('marca')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    La marca es requerida
                  </div>
                </div>

                <div>
                  <label
                    for="proveedor"
                    class="block text-sm font-medium text-gray-700 mb-1"
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
                      productForm.get('proveedor')?.invalid &&
                      productForm.get('proveedor')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('proveedor')?.invalid &&
                      productForm.get('proveedor')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El proveedor es requerido
                  </div>
                </div>
              </div>
            </div>

            <!-- Códigos y categorización -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Códigos y Categorización
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    for="codigo1"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Código Principal *
                  </label>
                  <input
                    id="codigo1"
                    type="text"
                    formControlName="codigo1"
                    class="input"
                    placeholder="Código principal"
                    [class.border-red-500]="
                      productForm.get('codigo1')?.invalid &&
                      productForm.get('codigo1')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('codigo1')?.invalid &&
                      productForm.get('codigo1')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El código principal es requerido
                  </div>
                </div>

                <div>
                  <label
                    for="codigo2"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Código Secundario *
                  </label>
                  <input
                    id="codigo2"
                    type="text"
                    formControlName="codigo2"
                    class="input"
                    placeholder="Código secundario"
                    [class.border-red-500]="
                      productForm.get('codigo2')?.invalid &&
                      productForm.get('codigo2')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('codigo2')?.invalid &&
                      productForm.get('codigo2')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El código secundario es requerido
                  </div>
                </div>

                <div>
                  <label
                    for="rubro"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rubro *
                  </label>
                  <select
                    id="rubro"
                    formControlName="rubro"
                    class="input"
                    [class.border-red-500]="
                      productForm.get('rubro')?.invalid &&
                      productForm.get('rubro')?.touched
                    "
                  >
                    <option value="">Seleccione un rubro</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Farmacia">Farmacia</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Automotriz">Automotriz</option>
                    <option value="Construcción">Construcción</option>
                  </select>
                  <div
                    *ngIf="
                      productForm.get('rubro')?.invalid &&
                      productForm.get('rubro')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El rubro es requerido
                  </div>
                </div>

                <div>
                  <label
                    for="categoria"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoría *
                  </label>
                  <input
                    id="categoria"
                    type="text"
                    formControlName="categoria"
                    class="input"
                    placeholder="Categoría específica"
                    [class.border-red-500]="
                      productForm.get('categoria')?.invalid &&
                      productForm.get('categoria')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('categoria')?.invalid &&
                      productForm.get('categoria')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    La categoría es requerida
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel lateral -->
          <div class="space-y-6">
            <!-- Inventario y precio -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Inventario y Precio
              </h3>
              <div class="space-y-4">
                <div>
                  <label
                    for="precio"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Precio ($) *
                  </label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    formControlName="precio"
                    class="input"
                    placeholder="0.00"
                    [class.border-red-500]="
                      productForm.get('precio')?.invalid &&
                      productForm.get('precio')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('precio')?.invalid &&
                      productForm.get('precio')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    <span
                      *ngIf="productForm.get('precio')?.errors?.['required']"
                    >
                      El precio es requerido
                    </span>
                    <span *ngIf="productForm.get('precio')?.errors?.['min']">
                      El precio debe ser mayor a 0
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    for="cantidad"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cantidad Inicial *
                  </label>
                  <input
                    id="cantidad"
                    type="number"
                    min="0"
                    formControlName="cantidad"
                    class="input"
                    placeholder="0"
                    [class.border-red-500]="
                      productForm.get('cantidad')?.invalid &&
                      productForm.get('cantidad')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('cantidad')?.invalid &&
                      productForm.get('cantidad')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    <span
                      *ngIf="productForm.get('cantidad')?.errors?.['required']"
                    >
                      La cantidad es requerida
                    </span>
                    <span *ngIf="productForm.get('cantidad')?.errors?.['min']">
                      La cantidad debe ser 0 o mayor
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    for="status"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Estado *
                  </label>
                  <select
                    id="status"
                    formControlName="status"
                    class="input"
                    [class.border-red-500]="
                      productForm.get('status')?.invalid &&
                      productForm.get('status')?.touched
                    "
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="AGOTADO">Agotado</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="RESERVADO">Reservado</option>
                  </select>
                  <div
                    *ngIf="
                      productForm.get('status')?.invalid &&
                      productForm.get('status')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    El estado es requerido
                  </div>
                </div>

                <div>
                  <label
                    for="ubicacion"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ubicación *
                  </label>
                  <input
                    id="ubicacion"
                    type="text"
                    formControlName="ubicacion"
                    class="input"
                    placeholder="Ej: Almacén A - Estante 1"
                    [class.border-red-500]="
                      productForm.get('ubicacion')?.invalid &&
                      productForm.get('ubicacion')?.touched
                    "
                  />
                  <div
                    *ngIf="
                      productForm.get('ubicacion')?.invalid &&
                      productForm.get('ubicacion')?.touched
                    "
                    class="mt-1 text-sm text-red-600"
                  >
                    La ubicación es requerida
                  </div>
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="card p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                Información Adicional
              </h3>
              <div class="space-y-4">
                <div>
                  <label
                    for="fechaVencimiento"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha de Vencimiento
                  </label>
                  <input
                    id="fechaVencimiento"
                    type="date"
                    formControlName="fechaVencimiento"
                    class="input"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Solo para productos perecederos
                  </p>
                </div>

                <div>
                  <label
                    for="lote"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lote
                  </label>
                  <input
                    id="lote"
                    type="text"
                    formControlName="lote"
                    class="input"
                    placeholder="Número de lote"
                  />
                </div>

                <div>
                  <label
                    for="notas"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notas
                  </label>
                  <textarea
                    id="notas"
                    formControlName="notas"
                    rows="3"
                    class="input"
                    placeholder="Notas adicionales sobre el producto"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <a routerLink="/productos" class="btn btn-secondary"> Cancelar </a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="productForm.invalid || isSubmitting"
          >
            <span *ngIf="isSubmitting">
              {{ isEditing ? "Actualizando..." : "Guardando..." }}
            </span>
            <span *ngIf="!isSubmitting">
              {{ isEditing ? "Actualizar Producto" : "Guardar Producto" }}
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditing = false;
  productId: string | null = null;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get("id");
    this.isEditing = !!this.productId;

    if (this.isEditing && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      nombre: ["", [Validators.required]],
      descripcion: ["", [Validators.required]],
      precio: ["", [Validators.required, Validators.min(0)]],
      proveedor: ["", [Validators.required]],
      cantidad: ["", [Validators.required, Validators.min(0)]],
      codigo1: ["", [Validators.required]],
      codigo2: ["", [Validators.required]],
      rubro: ["", [Validators.required]],
      categoria: ["", [Validators.required]],
      marca: ["", [Validators.required]],
      fechaVencimiento: [""],
      lote: [""],
      status: ["", [Validators.required]],
      notas: [""],
      ubicacion: ["", [Validators.required]],
    });
  }

  private loadProduct(id: string) {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue({
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            proveedor: product.proveedor,
            cantidad: product.cantidad,
            codigo1: product.codigo1,
            codigo2: product.codigo2,
            rubro: product.rubro,
            categoria: product.categoria,
            marca: product.marca,
            fechaVencimiento: product.fechaVencimiento
              ? new Date(product.fechaVencimiento).toISOString().split("T")[0]
              : "",
            lote: product.lote || "",
            status: product.status,
            notas: product.notas || "",
            ubicacion: product.ubicacion,
          });
        }
      },
      error: (error) => {
        console.error("Error al cargar producto:", error);
        alert("Error al cargar el producto. Regresando a la lista.");
        this.router.navigate(["/productos"]);
      },
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      const formData: ProductFormData = this.productForm.value;

      const operation = this.isEditing
        ? this.productService.updateProduct(this.productId!, formData)
        : this.productService.createProduct(formData);

      operation.subscribe({
        next: () => {
          const message = this.isEditing
            ? "Producto actualizado exitosamente"
            : "Producto creado exitosamente";
          alert(message);
          this.router.navigate(["/productos"]);
        },
        error: (error) => {
          console.error("Error al guardar producto:", error);
          alert("Error al guardar el producto. Intenta de nuevo.");
          this.isSubmitting = false;
        },
      });
    } else {
      Object.keys(this.productForm.controls).forEach((key) => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
