import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service'; 
import { EventService } from '../../core/services/event.service';  // Importamos EventService
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone : true,
  imports:[CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false; // Variable para verificar si está autenticado
  userRole: string | null = 'usuario-invitado'; // Almacena el rol del usuario
  userEmail: string | null = null;  // Almacena el email del usuario
  userMenuOpen: boolean = false;  // Para controlar la visibilidad del menú de usuario
  notificationsOpen: boolean = false;  // Para controlar la visibilidad de las notificaciones
  events: any[] = [];  // Lista de eventos para las notificaciones

  constructor(
    private authService: AuthService, 
    private router: Router,
    private eventService: EventService  // Inyectamos EventService
  ) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(authStatus => {
      this.isAuthenticated = authStatus;
      if (this.isAuthenticated) {
        this.loadUserEmail();
      }
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });
  }

  // Cargar el email del usuario
  loadUserEmail() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email;
    }
  }

  // Abrir el menú del usuario
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.notificationsOpen = false; // Cerrar notificaciones al abrir el menú de usuario
    }
  }

  // Cerrar sesión
  logout() {
    const confirmation = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmation) {
      this.authService.logout().then(() => {
        this.router.navigate(['/home']);
      }).catch(error => console.error('Logout error:', error));
    }
  }

  // Abrir/ cerrar las notificaciones
  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.userMenuOpen = false; // Cerrar el menú de usuario al abrir las notificaciones
      this.loadEvents(); // Cargar eventos al abrir notificaciones
    }
  }

  // Cargar los eventos actuales
  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  // Navegar a la página de actividades
  goToEvent(event: any) {
    this.router.navigate(['/home/activities']);
    this.notificationsOpen = false;  // Cerrar la tarjeta de notificaciones
  }
}