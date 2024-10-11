import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';import { Router } from '@angular/router';
import { AdminPageComponent } from '../admin-page/admin-page.component';
import { HeaderComponent } from "../../layout/header/header.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule, AdminPageComponent,
    HeaderComponent
],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit { 
  role: string | null = 'usuario-invitado'; // Usuario invitado por defecto

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Verificar si hay un usuario logueado y obtener su rol
    this.authService.getCurrentUserRole()
      .then((role: string | null) => {
        this.role = role || 'usuario-invitado'; // Si no hay rol, es 'usuario-invitado'
      })
      .catch(error => {
        console.error('Error al obtener el rol del usuario:', error);
      });
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.role = 'usuario-invitado'; // Cambiar el rol a 'usuario-invitado' al cerrar sesión
        this.router.navigate(['/home']);
      })
      .catch((error) => console.error('Logout error:', error));
  }
}
