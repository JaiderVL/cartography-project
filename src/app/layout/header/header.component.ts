import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service'; // Asegúrate de que AuthService está en la ruta correcta
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importa el Router para redirigir

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'] // Cambiado a "styleUrls"
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false; // Variable para verificar si está autenticado

  constructor(private authService: AuthService, private router: Router) {} // Inyecta el Router

  ngOnInit() {
    // Suscribirse al estado de autenticación del usuario
    this.authService.isAuthenticated$.subscribe(authStatus => {
      this.isAuthenticated = authStatus;
    });
  }

  logout() {
    this.authService.logout().then(() => {
      // Redirige a la página de inicio de usuario invitado
      this.router.navigate(['/home']);
      console.log('User logged out');
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }
}