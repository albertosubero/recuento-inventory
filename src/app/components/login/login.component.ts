import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { LoginRequest } from "../../models/user.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <div class="max-w-md w-full space-y-8 p-8">
        <div class="card p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900">
              Sistema de Inventario
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                class="input mt-1"
                placeholder="usuario@empresa.com"
                [class.border-red-500]="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
              />
              <div
                *ngIf="
                  loginForm.get('email')?.invalid &&
                  loginForm.get('email')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="loginForm.get('email')?.errors?.['required']">
                  El correo electrónico es requerido
                </span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">
                  Ingresa un correo electrónico válido
                </span>
              </div>
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                class="input mt-1"
                placeholder="••••••••"
                [class.border-red-500]="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
              />
              <div
                *ngIf="
                  loginForm.get('password')?.invalid &&
                  loginForm.get('password')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="loginForm.get('password')?.errors?.['required']">
                  La contraseña es requerida
                </span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">
                  La contraseña debe tener al menos 6 caracteres
                </span>
              </div>
            </div>

            <div *ngIf="errorMessage" class="text-sm text-red-600 text-center">
              {{ errorMessage }}
            </div>

            <div>
              <button
                type="submit"
                class="btn btn-primary w-full py-3 text-base"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="isLoading">Iniciando sesión...</span>
                <span *ngIf="!isLoading">Iniciar Sesión</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center text-sm text-gray-600">
            <p class="mb-2">Usuarios de demostración:</p>
            <div class="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin&#64;inventory.com / admin123</p>
              <p>
                <strong>Manager:</strong> manager&#64;inventory.com / manager123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.authService.authState$.subscribe((authState) => {
      this.isLoading = authState.isLoading;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = "";
      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          // El AuthService maneja la redirección
        },
        error: (error) => {
          this.errorMessage =
            error.message || "Error al iniciar sesión. Intenta de nuevo.";
        },
      });
    }
  }
}
