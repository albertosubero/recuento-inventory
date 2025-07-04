import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { map, tap, delay } from "rxjs/operators";

import {
  Product,
  ProductFormData,
  ProductStatus,
  InventoryMovement,
  MovementType,
  StockAlert,
  AlertType,
} from "../models/product.model";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private products = new BehaviorSubject<Product[]>([]);
  private movements = new BehaviorSubject<InventoryMovement[]>([]);
  private alerts = new BehaviorSubject<StockAlert[]>([]);

  public products$ = this.products.asObservable();
  public movements$ = this.movements.asObservable();
  public alerts$ = this.alerts.asObservable();

  constructor(private http: HttpClient) {
    this.loadDemoData();
  }

  private loadDemoData(): void {
    // Datos de demostración - remover en producción
    const demoProducts: Product[] = [
      {
        id: "1",
        nombre: "Laptop HP Pavilion",
        descripcion: "Laptop HP Pavilion 15.6 pulgadas, 8GB RAM, 256GB SSD",
        precio: 899.99,
        proveedor: "HP Inc.",
        cantidad: 15,
        codigo1: "HP-LAP-001",
        codigo2: "PAV-156-8256",
        imagenes: ["laptop-hp.jpg"],
        rubro: "Electrónicos",
        categoria: "Computadoras",
        marca: "HP",
        fechaVencimiento: undefined,
        lote: "LOT-2024-001",
        status: ProductStatus.ACTIVO,
        notas: "Modelo más vendido de la marca",
        ubicacion: "Almacén A - Estante 1",
        fechaCreacion: new Date("2024-01-15"),
        fechaActualizacion: new Date("2024-01-20"),
      },
      {
        id: "2",
        nombre: "Mouse Inalámbrico Logitech",
        descripcion: "Mouse inalámbrico Logitech MX Master 3",
        precio: 79.99,
        proveedor: "Logitech",
        cantidad: 5,
        codigo1: "LOG-MOU-001",
        codigo2: "MX-MST-3",
        imagenes: ["mouse-logitech.jpg"],
        rubro: "Electrónicos",
        categoria: "Accesorios",
        marca: "Logitech",
        fechaVencimiento: undefined,
        lote: "LOT-2024-002",
        status: ProductStatus.ACTIVO,
        notas: "Stock bajo - reabastecer pronto",
        ubicacion: "Almacén A - Estante 2",
        fechaCreacion: new Date("2024-01-10"),
        fechaActualizacion: new Date("2024-01-18"),
      },
      {
        id: "3",
        nombre: "Medicamento Paracetamol",
        descripcion: "Paracetamol 500mg - Caja con 20 tabletas",
        precio: 5.99,
        proveedor: "Farmacéutica ABC",
        cantidad: 0,
        codigo1: "MED-PAR-001",
        codigo2: "PAR-500-20",
        imagenes: ["paracetamol.jpg"],
        rubro: "Farmacia",
        categoria: "Analgésicos",
        marca: "Genérico",
        fechaVencimiento: new Date("2024-12-31"),
        lote: "LOT-2024-003",
        status: ProductStatus.AGOTADO,
        notas: "Producto agotado - pedido urgente",
        ubicacion: "Farmacia - Estante B",
        fechaCreacion: new Date("2024-01-05"),
        fechaActualizacion: new Date("2024-01-22"),
      },
    ];

    const demoMovements: InventoryMovement[] = [
      {
        id: "1",
        productId: "1",
        tipo: MovementType.ENTRADA,
        cantidad: 20,
        cantidadAnterior: 0,
        cantidadNueva: 20,
        motivo: "Compra inicial de inventario",
        usuario: "admin@inventory.com",
        fecha: new Date("2024-01-15"),
        lote: "LOT-2024-001",
        ubicacion: "Almacén A - Estante 1",
      },
      {
        id: "2",
        productId: "1",
        tipo: MovementType.SALIDA,
        cantidad: 5,
        cantidadAnterior: 20,
        cantidadNueva: 15,
        motivo: "Venta al cliente",
        usuario: "manager@inventory.com",
        fecha: new Date("2024-01-20"),
        lote: "LOT-2024-001",
        ubicacion: "Almacén A - Estante 1",
      },
    ];

    const demoAlerts: StockAlert[] = [
      {
        id: "1",
        productId: "2",
        tipo: AlertType.STOCK_BAJO,
        message: "Stock bajo: Mouse Inalámbrico Logitech (5 unidades)",
        fecha: new Date(),
        leido: false,
      },
      {
        id: "2",
        productId: "3",
        tipo: AlertType.STOCK_AGOTADO,
        message: "Stock agotado: Medicamento Paracetamol",
        fecha: new Date(),
        leido: false,
      },
    ];

    this.products.next(demoProducts);
    this.movements.next(demoMovements);
    this.alerts.next(demoAlerts);
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProduct(id: string): Observable<Product | undefined> {
    return this.products$.pipe(
      map((products) => products.find((p) => p.id === id)),
    );
  }

  createProduct(productData: ProductFormData): Observable<Product> {
    const newProduct: Product = {
      id: this.generateId(),
      ...productData,
      precio: Number(productData.precio),
      cantidad: Number(productData.cantidad),
      imagenes: [],
      fechaVencimiento: productData.fechaVencimiento
        ? new Date(productData.fechaVencimiento)
        : undefined,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    const currentProducts = this.products.value;
    this.products.next([...currentProducts, newProduct]);

    // Crear movimiento de entrada
    this.addInventoryMovement({
      productId: newProduct.id!,
      tipo: MovementType.ENTRADA,
      cantidad: newProduct.cantidad,
      cantidadAnterior: 0,
      cantidadNueva: newProduct.cantidad,
      motivo: "Creación de producto",
      usuario: "current-user", // En producción obtener del servicio de auth
      fecha: new Date(),
      lote: newProduct.lote,
      ubicacion: newProduct.ubicacion,
    });

    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: string, productData: ProductFormData): Observable<Product> {
    const currentProducts = this.products.value;
    const productIndex = currentProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return throwError(() => new Error("Producto no encontrado"));
    }

    const currentProduct = currentProducts[productIndex];
    const updatedProduct: Product = {
      ...currentProduct,
      ...productData,
      precio: Number(productData.precio),
      cantidad: Number(productData.cantidad),
      fechaVencimiento: productData.fechaVencimiento
        ? new Date(productData.fechaVencimiento)
        : undefined,
      fechaActualizacion: new Date(),
    };

    // Si cambió la cantidad, crear movimiento
    if (currentProduct.cantidad !== updatedProduct.cantidad) {
      const cantidadDiferencia =
        updatedProduct.cantidad - currentProduct.cantidad;
      this.addInventoryMovement({
        productId: id,
        tipo:
          cantidadDiferencia > 0 ? MovementType.ENTRADA : MovementType.SALIDA,
        cantidad: Math.abs(cantidadDiferencia),
        cantidadAnterior: currentProduct.cantidad,
        cantidadNueva: updatedProduct.cantidad,
        motivo: "Ajuste de inventario",
        usuario: "current-user",
        fecha: new Date(),
        lote: updatedProduct.lote,
        ubicacion: updatedProduct.ubicacion,
      });
    }

    currentProducts[productIndex] = updatedProduct;
    this.products.next([...currentProducts]);

    return of(updatedProduct).pipe(delay(500));
  }

  deleteProduct(id: string): Observable<boolean> {
    const currentProducts = this.products.value;
    const filteredProducts = currentProducts.filter((p) => p.id !== id);
    this.products.next(filteredProducts);
    return of(true).pipe(delay(500));
  }

  getInventoryMovements(): Observable<InventoryMovement[]> {
    return this.movements$;
  }

  addInventoryMovement(movement: Omit<InventoryMovement, "id">): void {
    const newMovement: InventoryMovement = {
      id: this.generateId(),
      ...movement,
    };

    const currentMovements = this.movements.value;
    this.movements.next([newMovement, ...currentMovements]);
  }

  getStockAlerts(): Observable<StockAlert[]> {
    return this.alerts$;
  }

  markAlertAsRead(alertId: string): Observable<boolean> {
    const currentAlerts = this.alerts.value;
    const alertIndex = currentAlerts.findIndex((a) => a.id === alertId);

    if (alertIndex !== -1) {
      currentAlerts[alertIndex].leido = true;
      this.alerts.next([...currentAlerts]);
    }

    return of(true);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  // Métodos de búsqueda y filtrado
  searchProducts(query: string): Observable<Product[]> {
    return this.products$.pipe(
      map((products) =>
        products.filter(
          (product) =>
            product.nombre.toLowerCase().includes(query.toLowerCase()) ||
            product.codigo1.toLowerCase().includes(query.toLowerCase()) ||
            product.codigo2.toLowerCase().includes(query.toLowerCase()) ||
            product.marca.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    );
  }

  getProductsByCategory(categoria: string): Observable<Product[]> {
    return this.products$.pipe(
      map((products) =>
        products.filter((product) => product.categoria === categoria),
      ),
    );
  }

  getLowStockProducts(threshold: number = 10): Observable<Product[]> {
    return this.products$.pipe(
      map((products) =>
        products.filter((product) => product.cantidad <= threshold),
      ),
    );
  }
}
