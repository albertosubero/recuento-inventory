import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

import { NavigationComponent } from "./components/layout/navigation.component";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navigation *ngIf="showNavigation"></app-navigation>
      <main [class]="showNavigation ? 'ml-64 p-6' : 'p-0'">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit {
  showNavigation = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Escuchar cambios de ruta para mostrar/ocultar navegación
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe({
        next: (event) => {
          const navEvent = event as NavigationEnd;
          this.showNavigation = !navEvent.url.includes("/login");
        },
        error: (error) => {
          console.error("Router navigation error:", error);
        },
      });

    // Escuchar cambios en el estado de autenticación
    this.authService.authState$.subscribe({
      next: (authState) => {
        if (
          !authState.isLoggedIn &&
          this.router.url &&
          !this.router.url.includes("/login")
        ) {
          this.showNavigation = false;
        }
      },
      error: (error) => {
        console.error("Auth state error:", error);
      },
    });
  }
}
