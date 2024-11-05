import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { navbarData } from './nav-data';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';


interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

interface NavItem {
  routeLink: string;
  icon: string;
  label: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;

  // Aquí indicamos que navData y filteredNavData tienen el tipo NavItem[]
  navData: NavItem[] = navbarData; 
  filteredNavData: NavItem[] = []; // Inicialmente vacío, se llenará al filtrar

  role: string = 'usuario-invitado'; // Rol por defecto

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
    }
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    // Suscribirse al rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.role = role;
      this.updateNavData(); // Actualizar el menú cuando cambie el rol
    });

    // Inicializar el menú filtrado
    this.updateNavData();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  // Método para filtrar el menú según el rol
  updateNavData() {
    this.filteredNavData = this.navData.filter(item => {
      return item.roles.includes(this.role);
    });
  }
}
