import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const role = await this.authService.getCurrentUserRole();
    if (!role || role === 'usuario-invitado') {
      return true;
    } else {
      this.router.navigate(['/guest']); // Redirige si el usuario está autenticado
      return false;
    }
  }
}
