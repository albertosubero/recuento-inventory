import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap, catchError, of } from "rxjs";
import { Router } from "@angular/router";

import {
  User,
  LoginRequest,
  LoginResponse,
  AuthState,
} from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly TOKEN_KEY = "inventory_token";
  private readonly USER_KEY = "inventory_user";

  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,
  });

  public authState$ = this.authState.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState.next({
          user,
          token,
          isLoggedIn: true,
          isLoading: false,
        });
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);

    // Simulación de login para demo - en producción conectar con API real
    return this.simulateLogin(credentials).pipe(
      tap((response) => {
        this.setAuthData(response);
        this.router.navigate(["/dashboard"]);
      }),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      }),
    );
  }

  private simulateLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Datos de demo - remover en producción
    const demoUsers = [
      {
        email: "admin@inventory.com",
        password: "admin123",
        user: {
          id: "1",
          email: "admin@inventory.com",
          nombre: "Admin",
          apellido: "Sistema",
          rol: "ADMIN" as any,
          estado: "ACTIVO" as any,
          fechaCreacion: new Date(),
        },
      },
      {
        email: "manager@inventory.com",
        password: "manager123",
        user: {
          id: "2",
          email: "manager@inventory.com",
          nombre: "Manager",
          apellido: "Inventario",
          rol: "MANAGER" as any,
          estado: "ACTIVO" as any,
          fechaCreacion: new Date(),
        },
      },
    ];

    const foundUser = demoUsers.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );

    if (foundUser) {
      const response: LoginResponse = {
        user: foundUser.user,
        token: "demo_token_" + Date.now(),
        expiresIn: 3600,
      };
      return of(response);
    } else {
      throw new Error("Credenciales inválidas");
    }
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(["/login"]);
  }

  private setAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

    this.authState.next({
      user: response.user,
      token: response.token,
      isLoggedIn: true,
      isLoading: false,
    });
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.authState.next({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
    });
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authState.value;
    this.authState.next({
      ...currentState,
      isLoading: loading,
    });
  }

  get currentUser(): User | null {
    return this.authState.value.user;
  }

  get isLoggedIn(): boolean {
    return this.authState.value.isLoggedIn;
  }

  get token(): string | null {
    return this.authState.value.token;
  }
}
