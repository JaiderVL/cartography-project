import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { BodyComponent } from './layout/body/body.component';
import { HeaderComponent } from "./layout/header/header.component";
import { MainComponent } from './pages/main/main.component';
import { MapComponent } from './pages/map/map.component';
import { RegisterPageComponent } from "./auth/pages/register-page/register-page.component";
import { AuthService } from '../../src/app/core/services/auth.service';
interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BodyComponent,
    MainComponent,
    CommonModule,
    MapComponent,
    RegisterPageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'sidenav';

  isSideNavCollapsed = false;
  screenWidth = 0;
  showMap = true;
  isLoading = true; // Controla el estado de carga

  constructor(private router: Router, private authService: AuthService) {
    // Suscribirse a los eventos de navegación para mostrar u ocultar el mapa
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showMap = event.url !== '/map';
      }
    });
  }

  ngOnInit() {
    // Mostrar la pantalla de carga mientras se verifica la autenticación
    this.isLoading = true;

    // Suscribirse al estado del usuario
    this.authService.user$.subscribe(user => {
      this.isLoading = false; // Oculta la pantalla de carga cuando termina la verificación

      if (user) {
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
}
