import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { delay } from "rxjs/operators";

import {
  DeliveryOrder,
  DeliveryFormData,
  DeliveryStatus,
} from "../models/invoice.model";

@Injectable({
  providedIn: "root",
})
export class DeliveryService {
  private deliveries = new BehaviorSubject<DeliveryOrder[]>([]);
  public deliveries$ = this.deliveries.asObservable();

  constructor(private http: HttpClient) {
    this.loadDemoData();
  }

  private loadDemoData(): void {
    // Demo data
    const demoDeliveries: DeliveryOrder[] = [
      {
        id: "1",
        solicitudPedidoId: "1",
        numeroSalida: "SAL-2024-001",
        fechaEntrega: new Date("2024-01-25"),
        funcionarioAutorizado: "Juan Pérez Rodríguez",
        funcionarioEntrega: "María González",
        productos: [
          {
            productoId: "1",
            descripcion: "Laptop HP Pavilion",
            cantidadSolicitada: 2,
            cantidadEntregada: 2,
            observaciones: "Entregado completo",
          },
        ],
        observaciones: "Entrega realizada sin inconvenientes",
        estado: DeliveryStatus.ENTREGADO,
        fechaCreacion: new Date("2024-01-25"),
      },
    ];

    this.deliveries.next(demoDeliveries);
  }

  getDeliveries(): Observable<DeliveryOrder[]> {
    return this.deliveries$;
  }

  getDelivery(id: string): Observable<DeliveryOrder | undefined> {
    const deliveries = this.deliveries.value;
    const delivery = deliveries.find((d) => d.id === id);
    return of(delivery);
  }

  getDeliveriesByOrderRequest(
    orderRequestId: string,
  ): Observable<DeliveryOrder[]> {
    const deliveries = this.deliveries.value;
    const filtered = deliveries.filter(
      (d) => d.solicitudPedidoId === orderRequestId,
    );
    return of(filtered);
  }

  createDelivery(formData: DeliveryFormData): Observable<DeliveryOrder> {
    const newDelivery: DeliveryOrder = {
      id: this.generateId(),
      solicitudPedidoId: formData.solicitudPedidoId,
      numeroSalida: this.generateDeliveryNumber(),
      fechaEntrega: new Date(formData.fechaEntrega),
      funcionarioAutorizado: formData.funcionarioAutorizado,
      funcionarioEntrega: formData.funcionarioEntrega,
      productos: formData.productos,
      observaciones: formData.observaciones,
      firmaDigital: formData.firmaDigital,
      estado: this.calculateDeliveryStatus(formData.productos),
      fechaCreacion: new Date(),
    };

    const currentDeliveries = this.deliveries.value;
    this.deliveries.next([newDelivery, ...currentDeliveries]);

    return of(newDelivery).pipe(delay(500));
  }

  private calculateDeliveryStatus(productos: any[]): DeliveryStatus {
    const allDelivered = productos.every(
      (p) => p.cantidadEntregada === p.cantidadSolicitada,
    );
    const noneDelivered = productos.every((p) => p.cantidadEntregada === 0);

    if (allDelivered) return DeliveryStatus.ENTREGADO;
    if (noneDelivered) return DeliveryStatus.PENDIENTE;
    return DeliveryStatus.PARCIAL;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  generateDeliveryNumber(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `SAL-${year}${month}${day}-${random}`;
  }
}
