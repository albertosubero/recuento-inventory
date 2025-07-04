import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { User } from "../../models/user.model";

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
}

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50">
      <!-- Logo y título -->
      <div class="flex items-center p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
              <path
                fill-rule="evenodd"
                d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900">Inventario</h1>
            <p class="text-sm text-gray-500">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <!-- Información del usuario -->
      <div class="p-4 border-b border-gray-200" *ngIf="currentUser">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <span class="text-sm font-medium text-gray-600">
              {{ getUserInitials(currentUser) }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ currentUser.nombre }} {{ currentUser.apellido }}
            </p>
            <p class="text-sm text-gray-500 truncate">
              {{ currentUser.email }}
            </p>
            <span
              class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
            >
              {{ currentUser.rol }}
            </span>
          </div>
        </div>
      </div>

      <!-- Menú de navegación -->
      <div class="flex-1 py-4">
        <ul class="space-y-1 px-3">
          <li *ngFor="let item of navigationItems">
            <ng-container *ngIf="!item.children">
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-700"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <span [innerHTML]="item.icon" class="mr-3 w-5 h-5"></span>
                {{ item.name }}
              </a>
            </ng-container>

            <ng-container *ngIf="item.children">
              <button
                (click)="toggleSubmenu(item.name)"
                class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <span [innerHTML]="item.icon" class="mr-3 w-5 h-5"></span>
                  {{ item.name }}
                </div>
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  [class.rotate-180]="openSubmenus.has(item.name)"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
              <ul
                *ngIf="openSubmenus.has(item.name)"
                class="mt-1 ml-6 space-y-1"
              >
                <li *ngFor="let child of item.children">
                  <a
                    [routerLink]="child.path"
                    routerLinkActive="bg-primary-50 text-primary-700 border-r-2 border-primary-700"
                    class="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  >
                    <span [innerHTML]="child.icon" class="mr-3 w-4 h-4"></span>
                    {{ child.name }}
                  </a>
                </li>
              </ul>
            </ng-container>
          </li>
        </ul>
      </div>

      <!-- Botón de cerrar sesión -->
      <div class="border-t border-gray-200 p-4">
        <button
          (click)="logout()"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
        >
          <svg
            class="mr-3 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  `,
})
export class NavigationComponent implements OnInit {
  currentUser: User | null = null;
  openSubmenus = new Set<string>();

  navigationItems: NavigationItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>`,
    },
    {
      name: "Productos",
      path: "/productos",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
      children: [
        {
          name: "Lista de Productos",
          path: "/productos",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"></path></svg>`,
        },
        {
          name: "Agregar Producto",
          path: "/productos/nuevo",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>`,
        },
      ],
    },
    {
      name: "Inventario",
      path: "/inventario",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path></svg>`,
      children: [
        {
          name: "Estado Actual",
          path: "/inventario",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>`,
        },
        {
          name: "Historial",
          path: "/inventario/historial",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>`,
        },
        {
          name: "Gestión de Stock",
          path: "/stock",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
        },
      ],
    },
    // {
    //   name: "Reportes",
    //   path: "/reportes",
    //   icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>`,
    // },
    {
      name: "Solicitudes",
      path: "/pedidos",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
      children: [
        {
          name: "Ver Solicitudes",
          path: "/pedidos",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
        },
        {
          name: "Nueva Solicitud",
          path: "/solicitud-pedido",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>`,
        },
      ],
    },
    {
      name: "Facturas",
      path: "/facturas",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clip-rule="evenodd"></path><path d="M6 8h8v2H6V8zM6 12h8v2H6v-2z"></path></svg>`,
      children: [
        {
          name: "Ver Facturas",
          path: "/facturas",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
        },
        {
          name: "Registrar Factura",
          path: "/registro-factura",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>`,
        },
      ],
    },
    {
      name: "Entregas",
      path: "/entregas",
      icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>`,
      children: [
        {
          name: "Ver Entregas",
          path: "/entregas",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>`,
        },
        {
          name: "Salida de Pedido",
          path: "/salida-pedido",
          icon: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path></svg>`,
        },
      ],
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.authState$.subscribe((authState) => {
      this.currentUser = authState.user;
    });
  }

  toggleSubmenu(itemName: string) {
    if (this.openSubmenus.has(itemName)) {
      this.openSubmenus.delete(itemName);
    } else {
      this.openSubmenus.add(itemName);
    }
  }

  getUserInitials(user: User): string {
    return (user.nombre.charAt(0) + user.apellido.charAt(0)).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
