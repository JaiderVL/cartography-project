import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Importa el servicio de autenticación
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1), // Solo toma el primer valor
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true; // Permitir acceso si el usuario está autenticado
        } else {
          this.router.navigate(['/auth/login']); // Redirige al login si no está autenticado
          return false;
        }
      })
    );
  }
}
