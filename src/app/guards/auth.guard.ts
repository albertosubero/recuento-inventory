import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { map, take } from "rxjs/operators";
import { Observable } from "rxjs";

import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map((authState) => {
        if (authState.isLoggedIn) {
          return true;
        } else {
          this.router.navigate(["/login"], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      }),
    );
  }
}

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map((authState) => {
        if (!authState.isLoggedIn) {
          return true;
        } else {
          this.router.navigate(["/dashboard"]);
          return false;
        }
      }),
    );
  }
}
