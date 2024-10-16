import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';import { Router } from '@angular/router';
import { AdminPageComponent } from '../admin-page/admin-page.component';
import { HeaderComponent } from "../../layout/header/header.component";
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule, AdminPageComponent,
    HeaderComponent,
    SidebarComponent
],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit { 
  role: string | null = 'usuario-invitado'; // Usuario invitado por defecto

  constructor(private authService: AuthService, private router: Router) {}

   ngOnInit() {
    // Suscribirse al rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.role = role;
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
