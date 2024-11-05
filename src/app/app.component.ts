import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../src/app/core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  isLoading = true; // Controla el estado de carga

  constructor(private router: Router, private authService: AuthService) {  }
  
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
}
