import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';import { Router, RouterModule } from '@angular/router';
import { AdminPageComponent } from '../../pages/admin-page/admin-page.component';
import { HeaderComponent } from "../../layout/header/header.component";
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";
import { MapComponent } from "../../pages/map/map.component";

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule, AdminPageComponent,
    HeaderComponent,
    SidebarComponent,
    AdminPageComponent,
    RouterModule,
    MapComponent
],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit { 
  role: string | null = 'usuario-invitado'; // Usuario invitado por defecto
  isSideNavCollapsed = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Suscribirse al rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.role = role;
    });
  }
  onToggleSideNav(data: SideNavToggle): void {
    this.isSideNavCollapsed = data.collapsed;
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
