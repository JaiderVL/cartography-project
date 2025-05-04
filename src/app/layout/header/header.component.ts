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
  filteredEvents: any[] = []; // Lista de eventos filtrados que no han pasado
  hasNewEvents: boolean = false; // Indicador de eventos nuevos

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
      // Si se cargan eventos nuevos, activamos el indicador
      if (events.length > 0) {
        this.hasNewEvents = true; // Hay eventos nuevos
      } else {
        this.hasNewEvents = false; // No hay nuevos eventos
      }

      this.filterUpcomingEvents(events);
    });
  }

  
  filterUpcomingEvents(events: any[]) {
    const currentDate = new Date(); // Obtener la fecha y hora actual

    // Filtrar eventos que aún no han pasado
    this.filteredEvents = events.filter(event => {
      const eventDate = new Date(event.year, event.month - 1, event.date, 
        parseInt(event.timeFrom.split(':')[0]), parseInt(event.timeFrom.split(':')[1]));

      // Comparar la fecha y hora del evento con la actual
      return eventDate > currentDate;
    });

    // Si hay eventos futuros, activamos el indicador
    if (this.filteredEvents.length > 0) {
      this.hasNewEvents = true;
    } else {
      this.hasNewEvents = false;
    }
  }

  goToEvent(event: any) {
    this.router.navigate(['/home/activities']);
    this.notificationsOpen = false;  // Cerrar las notificaciones al navegar
  }

}