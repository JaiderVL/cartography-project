import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    async canActivate(): Promise<boolean> {
    const role = await this.authService.getCurrentUserRole();
    if (role === 'administrador') {
        return true;
    } else {
      this.router.navigate(['/auth/login']); // Redirige si el usuario no es administrador
        return false;
    }
    }
}
