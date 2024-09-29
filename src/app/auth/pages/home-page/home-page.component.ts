import { CommonModule } from '@angular/common';
import { Component , OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit { 
  role: string | null = null; // Variable para almacenar el rol del usuario

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Obtiene el rol del usuario al inicializar el componente
    this.authService.getCurrentUserRole()
      .then(role => {
        this.role = role; // Asigna el rol a la variable `role`
      })
      .catch(error => {
        console.error('Error al obtener el rol del usuario:', error);
      });
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.router.navigate(['/auth/login']); // Redirige al login después de cerrar sesión
      })
      .catch((error) => console.error('Logout error:', error));
  }
}