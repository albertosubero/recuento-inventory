import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay, tap } from "rxjs/operators";

import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
  InvoiceDocument,
} from "../models/invoice.model";
import { ProductService } from "./product.service";

@Injectable({
  providedIn: "root",
})
export class InvoiceService {
  private invoices = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoices.asObservable();

  constructor(
    private http: HttpClient,
    private productService: ProductService,
  ) {
    this.loadDemoData();
  }

  private loadDemoData(): void {
    // Demo data
    const demoInvoices: Invoice[] = [
      {
        id: "1",
        numeroFactura: "FAC-2024-001",
        fecha: new Date("2024-01-20"),
        proveedor: "HP Inc.",
        productos: [
          {
            id: "1",
            descripcion: "Laptop HP Pavilion",
            cantidad: 2,
            precioUnitario: 899.99,
            subtotal: 1799.98,
          },
        ],
        montoTotal: 1799.98,
        documentos: [],
        solicitudPedidoId: "1",
        estado: InvoiceStatus.PROCESADA,
        fechaCreacion: new Date("2024-01-20"),
        usuarioCreacion: "admin@inventory.com",
        notas: "Factura procesada correctamente",
      },
    ];

    this.invoices.next(demoInvoices);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  getInvoice(id: string): Observable<Invoice | undefined> {
    const invoices = this.invoices.value;
    const invoice = invoices.find((i) => i.id === id);
    return of(invoice);
  }

  getInvoicesByOrderRequest(orderRequestId: string): Observable<Invoice[]> {
    const invoices = this.invoices.value;
    const filtered = invoices.filter(
      (i) => i.solicitudPedidoId === orderRequestId,
    );
    return of(filtered);
  }

  createInvoice(formData: InvoiceFormData): Observable<Invoice> {
    const newInvoice: Invoice = {
      id: this.generateId(),
      numeroFactura: formData.numeroFactura,
      fecha: new Date(formData.fecha),
      proveedor: formData.proveedor,
      productos: formData.productos,
      montoTotal: formData.montoTotal,
      documentos: [],
      solicitudPedidoId: formData.solicitudPedidoId,
      estado: InvoiceStatus.PENDIENTE,
      fechaCreacion: new Date(),
      usuarioCreacion: "current-user", // In production, get from auth service
      notas: formData.notas,
    };

    const currentInvoices = this.invoices.value;
    this.invoices.next([newInvoice, ...currentInvoices]);

    // Add products to inventory automatically
    this.addProductsToInventory(newInvoice.productos);

    return of(newInvoice).pipe(delay(500));
  }

  private addProductsToInventory(products: any[]): void {
    // This would integrate with the ProductService to add products to inventory
    products.forEach((product) => {
      // In a real implementation, you would:
      // 1. Check if product exists in inventory
      // 2. If exists, update quantity
      // 3. If not exists, create new product
      // 4. Create inventory movement record
      console.log(
        `Adding ${product.cantidad} units of ${product.descripcion} to inventory`,
      );
    });
  }

  uploadDocument(invoiceId: string, file: File): Observable<InvoiceDocument> {
    // Simulate file upload
    const document: InvoiceDocument = {
      id: this.generateId(),
      nombre: file.name,
      url: URL.createObjectURL(file), // In production, this would be the server URL
      tipo: file.type,
      tamaño: file.size,
      fechaSubida: new Date(),
    };

    // Add document to invoice
    const currentInvoices = this.invoices.value;
    const invoiceIndex = currentInvoices.findIndex((i) => i.id === invoiceId);
    if (invoiceIndex !== -1) {
      currentInvoices[invoiceIndex].documentos.push(document);
      this.invoices.next([...currentInvoices]);
    }

    return of(document).pipe(delay(1000));
  }

  updateInvoiceStatus(id: string, status: InvoiceStatus): Observable<boolean> {
    const currentInvoices = this.invoices.value;
    const invoiceIndex = currentInvoices.findIndex((i) => i.id === id);

    if (invoiceIndex !== -1) {
      currentInvoices[invoiceIndex].estado = status;
      this.invoices.next([...currentInvoices]);
    }

    return of(true).pipe(delay(300));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  generateInvoiceNumber(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `FAC-${year}${month}${day}-${random}`;
  }
}
