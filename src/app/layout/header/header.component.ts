import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service'; 
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false; // Variable para verificar si está autenticado
  userRole: string | null = 'usuario-invitado'; // Almacena el rol del usuario

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Suscribirse al estado de autenticación del usuario
    this.authService.isAuthenticated$.subscribe(authStatus => {
      this.isAuthenticated = authStatus;
    });

    // Suscribirse al rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch(error => console.error('Logout error:', error));
  }
}
