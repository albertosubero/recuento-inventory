import { Routes } from "@angular/router";
import { AuthGuard, LoginGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/login/login.component").then(
        (m) => m.LoginComponent,
      ),
    canActivate: [LoginGuard],
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "productos",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./components/products/product-list.component").then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: "nuevo",
        loadComponent: () =>
          import("./components/products/product-form.component").then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: ":id/editar",
        loadComponent: () =>
          import("./components/products/product-form.component").then(
            (m) => m.ProductFormComponent,
          ),
      },
    ],
  },
  {
    path: "stock",
    loadComponent: () =>
      import("./components/stock/stock.component").then(
        (m) => m.StockComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "inventario",
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./components/inventory/inventory.component").then(
            (m) => m.InventoryComponent,
          ),
      },
      {
        path: "historial",
        loadComponent: () =>
          import("./components/inventory/inventory-history.component").then(
            (m) => m.InventoryHistoryComponent,
          ),
      },
    ],
  },
  // {
  //   path: "reportes",
  //   loadComponent: () =>
  //     import("./components/reports/reports.component").then(
  //       (m) => m.ReportsComponent,
  //     ),
  //   canActivate: [AuthGuard],
  // },
  {
    path: "solicitud-pedido",
    loadComponent: () =>
      import("./components/order-request/order-request-form.component").then(
        (m) => m.OrderRequestFormComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "pedidos",
    loadComponent: () =>
      import("./components/order-request/order-request-list.component").then(
        (m) => m.OrderRequestListComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "facturas",
    loadComponent: () =>
      import("./components/invoice/invoice-list.component").then(
        (m) => m.InvoiceListComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "registro-factura",
    loadComponent: () =>
      import("./components/invoice/invoice-register.component").then(
        (m) => m.InvoiceRegisterComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "entregas",
    loadComponent: () =>
      import("./components/delivery/delivery-list.component").then(
        (m) => m.DeliveryListComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "salida-pedido",
    loadComponent: () =>
      import("./components/delivery/delivery-order.component").then(
        (m) => m.DeliveryOrderComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    loadComponent: () =>
      import("./components/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
];
