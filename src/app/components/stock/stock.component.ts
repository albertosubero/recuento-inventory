import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { ProductService } from "../../services/product.service";
import { Product, ProductStatus } from "../../models/product.model";

@Component({
  selector: "app-stock",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
          <p class="text-gray-600">Control y monitoreo de existencias</p>
        </div>
        <div class="flex space-x-3">
          <button
            (click)="exportData()"
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
            routerLink="/productos/nuevo"
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
            <span>Nuevo Producto</span>
          </a>
        </div>
      </div>

      <!-- Tarjetas de resumen -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Total</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ totalStock$ | async }}
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
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ lowStockCount$ | async }}
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
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Agotados</p>
              <p class="text-2xl font-bold text-red-600">
                {{ outOfStockCount$ | async }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Valor Total</p>
              <p class="text-2xl font-bold text-green-600">
                \${{ totalValue$ | async | number: "1.2-2" }}
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

      <!-- Filtros -->
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
              placeholder="Nombre, código..."
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Stock
            </label>
            <select
              [(ngModel)]="selectedStockLevel"
              (ngModelChange)="onStockLevelChange($event)"
              class="input"
            >
              <option value="">Todos</option>
              <option value="normal">Stock Normal (>10)</option>
              <option value="bajo">Stock Bajo (1-10)</option>
              <option value="agotado">Agotado (0)</option>
            </select>
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
              <option value="">Todas</option>
              <option
                *ngFor="let category of categories$ | async"
                [value]="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="clearFilters()"
              class="btn btn-secondary w-full"
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de stock -->
      <div class="card overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Control de Stock</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="bg-gray-50">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Valor Unitario</th>
                <th>Valor Total</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="(filteredProducts$ | async)?.length === 0">
                <td colspan="9" class="text-center py-8 text-gray-500">
                  <div class="flex flex-col items-center">
                    <svg
                      class="w-12 h-12 mb-3 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      ></path>
                    </svg>
                    <p>No se encontraron productos</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let product of filteredProducts$ | async">
                <td>
                  <div class="flex items-center space-x-3">
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
                  <div class="flex items-center space-x-2">
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
                    <div
                      *ngIf="product.cantidad <= 10"
                      class="w-4 h-4 text-yellow-500"
                      title="Stock bajo"
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </td>
                <td class="text-sm text-gray-900">
                  \${{ product.precio | number: "1.2-2" }}
                </td>
                <td class="text-sm font-medium text-gray-900">
                  \${{ product.precio * product.cantidad | number: "1.2-2" }}
                </td>
                <td class="text-sm text-gray-500">{{ product.ubicacion }}</td>
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
                <td>
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="adjustStock(product, 'increase')"
                      class="text-green-600 hover:text-green-900 text-sm"
                      title="Aumentar stock"
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
                    </button>
                    <button
                      (click)="adjustStock(product, 'decrease')"
                      class="text-red-600 hover:text-red-900 text-sm"
                      title="Disminuir stock"
                      [disabled]="product.cantidad === 0"
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
                          d="M20 12H4"
                        ></path>
                      </svg>
                    </button>
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
export class StockComponent implements OnInit {
  products$: Observable<Product[]>;
  filteredProducts$: Observable<Product[]>;
  categories$: Observable<string[]>;
  totalStock$: Observable<number>;
  totalValue$: Observable<number>;
  lowStockCount$: Observable<number>;
  outOfStockCount$: Observable<number>;

  private searchSubject = new BehaviorSubject<string>("");
  private categorySubject = new BehaviorSubject<string>("");
  private stockLevelSubject = new BehaviorSubject<string>("");

  searchQuery = "";
  selectedCategory = "";
  selectedStockLevel = "";

  constructor(private productService: ProductService) {
    this.products$ = this.productService.getProducts();

    this.categories$ = this.products$.pipe(
      map((products) => [...new Set(products.map((p) => p.categoria))].sort()),
    );

    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchSubject.pipe(startWith("")),
      this.categorySubject.pipe(startWith("")),
      this.stockLevelSubject.pipe(startWith("")),
    ]).pipe(
      map(([products, search, category, stockLevel]) => {
        return products.filter((product) => {
          const matchesSearch =
            !search ||
            product.nombre.toLowerCase().includes(search.toLowerCase()) ||
            product.codigo1.toLowerCase().includes(search.toLowerCase()) ||
            product.codigo2.toLowerCase().includes(search.toLowerCase()) ||
            product.marca.toLowerCase().includes(search.toLowerCase());

          const matchesCategory = !category || product.categoria === category;

          let matchesStockLevel = true;
          if (stockLevel === "normal") {
            matchesStockLevel = product.cantidad > 10;
          } else if (stockLevel === "bajo") {
            matchesStockLevel = product.cantidad > 0 && product.cantidad <= 10;
          } else if (stockLevel === "agotado") {
            matchesStockLevel = product.cantidad === 0;
          }

          return matchesSearch && matchesCategory && matchesStockLevel;
        });
      }),
    );

    this.totalStock$ = this.products$.pipe(
      map((products) => products.reduce((sum, p) => sum + p.cantidad, 0)),
    );

    this.totalValue$ = this.products$.pipe(
      map((products) =>
        products.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
      ),
    );

    this.lowStockCount$ = this.products$.pipe(
      map(
        (products) =>
          products.filter((p) => p.cantidad > 0 && p.cantidad <= 10).length,
      ),
    );

    this.outOfStockCount$ = this.products$.pipe(
      map((products) => products.filter((p) => p.cantidad === 0).length),
    );
  }

  ngOnInit() {}

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(category: string) {
    this.categorySubject.next(category);
  }

  onStockLevelChange(level: string) {
    this.stockLevelSubject.next(level);
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedCategory = "";
    this.selectedStockLevel = "";
    this.searchSubject.next("");
    this.categorySubject.next("");
    this.stockLevelSubject.next("");
  }

  adjustStock(product: Product, action: "increase" | "decrease") {
    const quantityStr = prompt(
      `Ingresa la cantidad a ${action === "increase" ? "agregar" : "quitar"}:`,
      "1",
    );

    if (quantityStr) {
      const quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingresa una cantidad válida.");
        return;
      }

      const newQuantity =
        action === "increase"
          ? product.cantidad + quantity
          : Math.max(0, product.cantidad - quantity);

      const updatedProduct: any = {
        ...product,
        cantidad: newQuantity,
        precio: product.precio,
      };

      this.productService.updateProduct(product.id!, updatedProduct).subscribe({
        next: () => {
          console.log("Stock actualizado exitosamente");
        },
        error: (error) => {
          console.error("Error al actualizar stock:", error);
          alert("Error al actualizar el stock. Intenta de nuevo.");
        },
      });
    }
  }

  exportData() {
    this.filteredProducts$.subscribe((products) => {
      const csvData = products.map((product) => ({
        Producto: product.nombre,
        Código: product.codigo1,
        Marca: product.marca,
        Categoría: product.categoria,
        Stock: product.cantidad,
        Precio: product.precio,
        "Valor Total": product.precio * product.cantidad,
        Ubicación: product.ubicacion,
        Estado: product.status,
      }));

      const csv = this.convertToCSV(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `stock_${new Date().toISOString().split("T")[0]}.csv`,
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
