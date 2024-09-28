import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent { 

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/auth/login']); // Redirige al login después de cerrar sesión
      })
      .catch((error) => console.error('Logout error:', error));
  }

}
