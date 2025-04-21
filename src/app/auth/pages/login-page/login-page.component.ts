import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['../page.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null; // Variable para manejar el mensaje de error
  isLoading: boolean = false; // Variable para mostrar el indicador de carga


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true; // Mostrar el mensaje de carga
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .then(() => {
          this.isLoading = false; // Ocultar el mensaje de carga
          console.log('User logged in');
          this.router.navigate(['/home'], { replaceUrl: true }); // Reemplaza la entrada de historial
        })
        .catch(error => {
          this.isLoading = false; // Ocultar el mensaje de carga
          console.error('Login error:', error);
          this.errorMessage = 'Incorrect email or password. Please try again.'; // Establece el mensaje de error
        });
    }
  }

  loginWithGoogle() {
    this.isLoading = true; // Mostrar el mensaje de carga
    this.authService.loginWithGoogle()
      .then(() => {
        this.isLoading = false; // Ocultar el mensaje de carga
        console.log('User logged in with Google');
        this.router.navigate(['/home'], { replaceUrl: true });
      })
      .catch(error => {
        this.isLoading = false; // Ocultar el mensaje de carga
        console.error('Google login error:', error);
      });
  }
}
