import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importa el AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['../page.component.css']
})
export class RegisterPageComponent {
  // Define el FormGroup con los campos del formulario
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private authService: AuthService, private router: Router) {}

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')!.value!;
      const password = this.registerForm.get('password')!.value!;
  
      this.authService.register(email, password)
        .then(() => {
          console.log('User registered');
          this.router.navigate(['/home']);
        })
        .catch(error => console.error('Registration error:', error));
    }
  }
  loginWithGoogle() {
    this.authService.loginWithGoogle()
      .then(() => {
        console.log('User logged in with Google');
        this.router.navigate(['/home']); // Redirige a la página de inicio después del login con Google
      })
      .catch(error => console.error('Google login error:', error));
  }
}
