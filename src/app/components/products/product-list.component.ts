import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { ProductService } from "../../services/product.service";
import { Product, ProductStatus } from "../../models/product.model";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
          <p class="text-gray-600">Gestión del catálogo de productos</p>
        </div>
        <a
          routerLink="/productos/nuevo"
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
          <span>Nuevo Producto</span>
        </a>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Nombre, código, marca..."
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onCategoryChange($event)"
              class="input"
            >
              <option value="">Todas las categorías</option>
              <option
                *ngFor="let category of categories$ | async"
                [value]="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onStatusChange($event)"
              class="input"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="AGOTADO">Agotado</option>
              <option value="VENCIDO">Vencido</option>
              <option value="RESERVADO">Reservado</option>
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

      <!-- Resumen -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Productos</p>
              <p class="text-xl font-bold text-gray-900">
                {{ (filteredProducts$ | async)?.length || 0 }}
              </p>
            </div>
            <div
              class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-blue-600"
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
            </div>
          </div>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Valor Total</p>
              <p class="text-xl font-bold text-gray-900">
                \${{ totalValue$ | async | number: "1.2-2" }}
              </p>
            </div>
            <div
              class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-green-600"
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

        <div class="card p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p class="text-xl font-bold text-red-600">
                {{ lowStockCount$ | async }}
              </p>
            </div>
            <div
              class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-red-600"
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
          </div>
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(filteredProducts$ | async)?.length === 0">
                <td colspan="8" class="text-center py-8 text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-3 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <p>No se encontraron productos</p>
                    <p class="text-sm">
                      Ajusta los filtros o agrega nuevos productos
                    </p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let product of filteredProducts$ | async">
                <td>
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <svg
                          class="w-5 h-5 text-gray-500"
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
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {{ product.nombre }}
                      </p>
                      <p class="text-sm text-gray-500">{{ product.marca }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <p class="text-sm text-gray-900">{{ product.codigo1 }}</p>
                    <p class="text-xs text-gray-500">{{ product.codigo2 }}</p>
                  </div>
                </td>
                <td>
                  <div>
                    <p class="text-sm text-gray-900">{{ product.categoria }}</p>
                    <p class="text-xs text-gray-500">{{ product.rubro }}</p>
                  </div>
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-red-100 text-red-800': product.cantidad === 0,
                      'bg-yellow-100 text-yellow-800':
                        product.cantidad > 0 && product.cantidad <= 5,
                      'bg-orange-100 text-orange-800':
                        product.cantidad > 5 && product.cantidad <= 10,
                      'bg-green-100 text-green-800': product.cantidad > 10,
                    }"
                  >
                    {{ product.cantidad }}
                  </span>
                </td>
                <td class="text-sm text-gray-900">
                  \${{ product.precio | number: "1.2-2" }}
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        product.status === 'ACTIVO',
                      'bg-gray-100 text-gray-800':
                        product.status === 'INACTIVO',
                      'bg-red-100 text-red-800': product.status === 'AGOTADO',
                      'bg-purple-100 text-purple-800':
                        product.status === 'VENCIDO',
                      'bg-blue-100 text-blue-800':
                        product.status === 'RESERVADO',
                    }"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="text-sm text-gray-500">{{ product.ubicacion }}</td>
                <td>
                  <div class="flex items-center space-x-2">
                    <a
                      [routerLink]="['/productos', product.id, 'editar']"
                      class="text-primary-600 hover:text-primary-900 text-sm"
                      title="Editar"
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
                      (click)="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900 text-sm"
                      title="Eliminar"
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
  `,
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  filteredProducts$: Observable<Product[]>;
  categories$: Observable<string[]>;
  totalValue$: Observable<number>;
  lowStockCount$: Observable<number>;

  private searchSubject = new BehaviorSubject<string>("");
  private categorySubject = new BehaviorSubject<string>("");
  private statusSubject = new BehaviorSubject<string>("");

  searchQuery = "";
  selectedCategory = "";
  selectedStatus = "";

  constructor(private productService: ProductService) {
    this.products$ = this.productService.getProducts();

    this.categories$ = this.products$.pipe(
      map((products) => [...new Set(products.map((p) => p.categoria))].sort()),
    );

    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchSubject.pipe(startWith("")),
      this.categorySubject.pipe(startWith("")),
      this.statusSubject.pipe(startWith("")),
    ]).pipe(
      map(([products, search, category, status]) => {
        return products.filter((product) => {
          const matchesSearch =
            !search ||
            product.nombre.toLowerCase().includes(search.toLowerCase()) ||
            product.codigo1.toLowerCase().includes(search.toLowerCase()) ||
            product.codigo2.toLowerCase().includes(search.toLowerCase()) ||
            product.marca.toLowerCase().includes(search.toLowerCase());

          const matchesCategory = !category || product.categoria === category;
          const matchesStatus = !status || product.status === status;

          return matchesSearch && matchesCategory && matchesStatus;
        });
      }),
    );

    this.totalValue$ = this.filteredProducts$.pipe(
      map((products) =>
        products.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
      ),
    );

    this.lowStockCount$ = this.filteredProducts$.pipe(
      map((products) => products.filter((p) => p.cantidad <= 10).length),
    );
  }

  ngOnInit() {}

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(category: string) {
    this.categorySubject.next(category);
  }

  onStatusChange(status: string) {
    this.statusSubject.next(status);
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedCategory = "";
    this.selectedStatus = "";
    this.searchSubject.next("");
    this.categorySubject.next("");
    this.statusSubject.next("");
  }

  deleteProduct(product: Product) {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el producto "${product.nombre}"?`,
      )
    ) {
      this.productService.deleteProduct(product.id!).subscribe({
        next: () => {
          console.log("Producto eliminado exitosamente");
        },
        error: (error) => {
          console.error("Error al eliminar producto:", error);
          alert("Error al eliminar el producto. Intenta de nuevo.");
        },
      });
    }
  }
}
