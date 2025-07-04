import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

import {
  OrderRequest,
  OrderRequestFormData,
  OrderRequestStatus,
} from "../models/order-request.model";

@Injectable({
  providedIn: "root",
})
export class OrderRequestService {
  private orderRequests = new BehaviorSubject<OrderRequest[]>([]);
  public orderRequests$ = this.orderRequests.asObservable();

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData(): void {
    const demoOrderRequests: OrderRequest[] = [
      {
        id: "1",
        fecha: new Date("2024-01-15"),
        numeroPedido: "PED-2024-001",
        dependencia: "Almacén Central",
        productos: [
          {
            id: "1",
            numeroOrden: "001",
            descripcion: "Laptop HP Pavilion 15.6 pulgadas",
            cantidadSolicitada: 5,
            observaciones: "Para oficina administrativa",
          },
          {
            id: "2",
            numeroOrden: "002",
            descripcion: "Mouse inalámbrico Logitech",
            cantidadSolicitada: 10,
            observaciones: "Modelo MX Master 3",
          },
        ],
        funcionarioAutorizado: "Juan Carlos Pérez",
        fechaCreacion: new Date("2024-01-15"),
        estado: OrderRequestStatus.PENDIENTE,
      },
    ];

    this.orderRequests.next(demoOrderRequests);
  }

  getOrderRequests(): Observable<OrderRequest[]> {
    return this.orderRequests$;
  }

  getOrderRequest(id: string): Observable<OrderRequest | undefined> {
    const orderRequests = this.orderRequests.value;
    const orderRequest = orderRequests.find((or) => or.id === id);
    return of(orderRequest);
  }

  createOrderRequest(
    orderRequestData: OrderRequestFormData,
  ): Observable<OrderRequest> {
    const newOrderRequest: OrderRequest = {
      id: this.generateId(),
      fecha: new Date(orderRequestData.fecha),
      numeroPedido: orderRequestData.numeroPedido,
      dependencia: orderRequestData.dependencia,
      productos: orderRequestData.productos.map((producto, index) => ({
        ...producto,
        id: this.generateId(),
      })),
      funcionarioAutorizado: orderRequestData.funcionarioAutorizado,
      fechaCreacion: new Date(),
      estado: OrderRequestStatus.PENDIENTE,
    };

    const currentOrderRequests = this.orderRequests.value;
    this.orderRequests.next([newOrderRequest, ...currentOrderRequests]);

    return of(newOrderRequest).pipe(delay(500));
  }

  updateOrderRequest(
    id: string,
    orderRequestData: OrderRequestFormData,
  ): Observable<OrderRequest> {
    const currentOrderRequests = this.orderRequests.value;
    const orderRequestIndex = currentOrderRequests.findIndex(
      (or) => or.id === id,
    );

    if (orderRequestIndex !== -1) {
      const updatedOrderRequest: OrderRequest = {
        ...currentOrderRequests[orderRequestIndex],
        fecha: new Date(orderRequestData.fecha),
        numeroPedido: orderRequestData.numeroPedido,
        dependencia: orderRequestData.dependencia,
        productos: orderRequestData.productos.map((producto) => ({
          ...producto,
          id: producto.id || this.generateId(),
        })),
        funcionarioAutorizado: orderRequestData.funcionarioAutorizado,
      };

      currentOrderRequests[orderRequestIndex] = updatedOrderRequest;
      this.orderRequests.next([...currentOrderRequests]);

      return of(updatedOrderRequest).pipe(delay(500));
    }

    throw new Error("Solicitud de pedido no encontrada");
  }

  deleteOrderRequest(id: string): Observable<boolean> {
    const currentOrderRequests = this.orderRequests.value;
    const filteredOrderRequests = currentOrderRequests.filter(
      (or) => or.id !== id,
    );
    this.orderRequests.next(filteredOrderRequests);
    return of(true).pipe(delay(500));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  generateOrderNumber(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const time = Date.now().toString().slice(-4);
    return `PED-${year}${month}${day}-${time}`;
  }
}
