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

interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  fields: string[];
}

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
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
                : "Completa los siguientes pasos para agregar un nuevo producto"
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

      <!-- Progress Stepper -->
      <div class="card p-6">
        <div class="flex items-center justify-between">
          <div
            *ngFor="let step of wizardSteps; let i = index"
            class="flex items-center"
          >
            <!-- Step Circle -->
            <div class="flex items-center relative">
              <div
                class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                [ngClass]="{
                  'bg-primary-600 border-primary-600 text-white':
                    currentStep > step.id,
                  'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100':
                    currentStep === step.id,
                  'border-gray-300 text-gray-400': currentStep < step.id,
                }"
              >
                <svg
                  *ngIf="currentStep > step.id"
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  *ngIf="currentStep <= step.id"
                  class="text-sm font-medium"
                  >{{ step.id }}</span
                >
              </div>
            </div>

            <!-- Step Info -->
            <div class="ml-4 min-w-0" *ngIf="currentStep === step.id">
              <p class="text-sm font-medium text-gray-900">{{ step.title }}</p>
              <p class="text-sm text-gray-500">{{ step.subtitle }}</p>
            </div>

            <!-- Connector Line -->
            <div
              *ngIf="i < wizardSteps.length - 1"
              class="hidden sm:block w-16 h-0.5 mx-4 transition-all duration-300"
              [ngClass]="{
                'bg-primary-600': currentStep > step.id,
                'bg-gray-300': currentStep <= step.id,
              }"
            ></div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              [style.width.%]="(currentStep / totalSteps) * 100"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>Paso {{ currentStep }} de {{ totalSteps }}</span>
            <span
              >{{ Math.round((currentStep / totalSteps) * 100) }}%
              completado</span
            >
          </div>
        </div>
      </div>

      <!-- Wizard Content -->
      <form [formGroup]="productForm" class="space-y-6">
        <!-- Step 1: Información Básica -->
        <div *ngIf="currentStep === 1" class="card p-8">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div
                [innerHTML]="wizardSteps[0].icon"
                class="w-8 h-8 text-primary-600"
              ></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ wizardSteps[0].title }}
            </h2>
            <p class="text-gray-600 mt-2">{{ wizardSteps[0].subtitle }}</p>
          </div>

          <div class="max-w-2xl mx-auto space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label
                  for="nombre"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  rows="4"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
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
        </div>

        <!-- Step 2: Códigos y Categorización -->
        <div *ngIf="currentStep === 2" class="card p-8">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div
                [innerHTML]="wizardSteps[1].icon"
                class="w-8 h-8 text-primary-600"
              ></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ wizardSteps[1].title }}
            </h2>
            <p class="text-gray-600 mt-2">{{ wizardSteps[1].subtitle }}</p>
          </div>

          <div class="max-w-2xl mx-auto space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  for="codigo1"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
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

        <!-- Step 3: Inventario y Precio -->
        <div *ngIf="currentStep === 3" class="card p-8">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div
                [innerHTML]="wizardSteps[2].icon"
                class="w-8 h-8 text-primary-600"
              ></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ wizardSteps[2].title }}
            </h2>
            <p class="text-gray-600 mt-2">{{ wizardSteps[2].subtitle }}</p>
          </div>

          <div class="max-w-2xl mx-auto space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  for="precio"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  <span *ngIf="productForm.get('precio')?.errors?.['required']"
                    >El precio es requerido</span
                  >
                  <span *ngIf="productForm.get('precio')?.errors?.['min']"
                    >El precio debe ser mayor a 0</span
                  >
                </div>
              </div>

              <div>
                <label
                  for="cantidad"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                    >La cantidad es requerida</span
                  >
                  <span *ngIf="productForm.get('cantidad')?.errors?.['min']"
                    >La cantidad debe ser 0 o mayor</span
                  >
                </div>
              </div>

              <div>
                <label
                  for="status"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
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
        </div>

        <!-- Step 4: Detalles Adicionales -->
        <div *ngIf="currentStep === 4" class="card p-8">
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div
                [innerHTML]="wizardSteps[3].icon"
                class="w-8 h-8 text-primary-600"
              ></div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ wizardSteps[3].title }}
            </h2>
            <p class="text-gray-600 mt-2">{{ wizardSteps[3].subtitle }}</p>
          </div>

          <div class="max-w-2xl mx-auto space-y-6">
            <div class="space-y-6">
              <div>
                <label
                  for="fechaVencimiento"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fecha de Vencimiento
                </label>
                <input
                  id="fechaVencimiento"
                  type="date"
                  formControlName="fechaVencimiento"
                  class="input"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Solo para productos perecederos
                </p>
              </div>

              <div>
                <label
                  for="lote"
                  class="block text-sm font-medium text-gray-700 mb-2"
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
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notas
                </label>
                <textarea
                  id="notas"
                  formControlName="notas"
                  rows="4"
                  class="input"
                  placeholder="Notas adicionales sobre el producto"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between items-center pt-8">
          <button
            type="button"
            (click)="previousStep()"
            class="btn btn-secondary flex items-center space-x-2"
            [disabled]="currentStep === 1"
            [class.opacity-50]="currentStep === 1"
            [class.cursor-not-allowed]="currentStep === 1"
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
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span>Anterior</span>
          </button>

          <div class="flex space-x-3">
            <a routerLink="/productos" class="btn btn-secondary"> Cancelar </a>

            <button
              *ngIf="currentStep < totalSteps"
              type="button"
              (click)="nextStep()"
              class="btn btn-primary flex items-center space-x-2"
              [disabled]="!isCurrentStepValid()"
            >
              <span>Siguiente</span>
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
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>

            <button
              *ngIf="currentStep === totalSteps"
              type="button"
              (click)="onSubmit()"
              class="btn btn-primary flex items-center space-x-2"
              [disabled]="productForm.invalid || isSubmitting"
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
                    ? "Actualizar Producto"
                    : "Guardar Producto"
              }}</span>
            </button>
          </div>
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

  // Wizard state
  currentStep = 1;
  totalSteps = 4;

  wizardSteps: WizardStep[] = [
    {
      id: 1,
      title: "Información Básica",
      subtitle: "Datos principales del producto",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
      fields: ["nombre", "descripcion", "marca", "proveedor"],
    },
    {
      id: 2,
      title: "Códigos y Categorización",
      subtitle: "Códigos y clasificación",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
      fields: ["codigo1", "codigo2", "rubro", "categoria"],
    },
    {
      id: 3,
      title: "Inventario y Precio",
      subtitle: "Pricing y stock inicial",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path></svg>`,
      fields: ["precio", "cantidad", "status", "ubicacion"],
    },
    {
      id: 4,
      title: "Detalles Adicionales",
      subtitle: "Información complementaria",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>`,
      fields: ["fechaVencimiento", "lote", "notas"],
    },
  ];

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

  // Wizard navigation methods
  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    const currentStepFields = this.wizardSteps[this.currentStep - 1].fields;
    return currentStepFields.every((field) => {
      const control = this.productForm.get(field);
      return control ? control.valid : true;
    });
  }

  // Utility method for template
  Math = Math;

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
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach((key) => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
