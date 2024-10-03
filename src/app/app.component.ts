import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { BodyComponent } from './layout/body/body.component';
import { HeaderComponent } from "./layout/header/header.component";
import { MainComponent } from './pages/main/main.component';
import { MapComponent } from './pages/map/map.component';
import { RegisterPageComponent } from "./auth/pages/register-page/register-page.component";
import { AuthService } from './auth/services/auth.service'; // Importa el AuthService

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, BodyComponent, MainComponent, CommonModule, MapComponent, RegisterPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'sidenav';

  isSideNavCollapsed = false;
  screenWidth = 0;
  showMap = true;

  constructor(private router: Router, private authService: AuthService) {
    // Suscribirse a los eventos de navegación para mostrar u ocultar el mapa
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showMap = event.url !== '/map';
      }
    });
  }

  ngOnInit() {
    // Suscribirse al estado del usuario
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        // Si hay un usuario autenticado, obtener su rol
        const role = await this.authService.getCurrentUserRole();

        // Redirigir basado en el rol
        switch (role) {
          case 'administrador':
            this.router.navigate(['/home']);
            break;
          case 'usuario-regular':
          case 'moderador':
            this.router.navigate(['/home']);
            break;
          default:
            this.router.navigate(['/guest']);
            break;
        }
      } else {
        // Si no hay usuario autenticado, redirigir a la página de invitados
        this.router.navigate(['/guest']);
      }
    });
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
