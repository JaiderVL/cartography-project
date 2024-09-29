import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['../page.component.css']
})
export class RegisterPageComponent {
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordsMatchValidator });

  isLoading: boolean = false; // Variable para mostrar el indicador de carga
  errorMessage: string | null = null; // Variable para mostrar el mensaje de error

  constructor(private authService: AuthService, private router: Router) {}

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true; // Mostrar el mensaje de carga
      this.errorMessage = null; // Limpiar mensaje de error previo
      const email = this.registerForm.get('email')!.value!;
      const password = this.registerForm.get('password')!.value!;
  
      this.authService.register(email, password)
        .then(() => {
          this.isLoading = false; // Ocultar el mensaje de carga
          console.log('User registered');
          this.router.navigate(['/home']);
        })
        .catch(error => {
          this.isLoading = false; // Ocultar el mensaje de carga
          console.error('Registration error:', error);
          // Verificar si el error es de correo duplicado
          if (error.code === 'auth/email-already-in-use') {
            this.errorMessage = 'This email is already in use. Please use a different email.';
          } else {
            this.errorMessage = 'An error occurred during registration. Please try again.';
          }
        });
    }
  }

  loginWithGoogle() {
    this.isLoading = true; // Mostrar el mensaje de carga
    this.authService.loginWithGoogle()
      .then(() => {
        this.isLoading = false; // Ocultar el mensaje de carga
        console.log('User logged in with Google');
        this.router.navigate(['/home']);
      })
      .catch(error => {
        this.isLoading = false; // Ocultar el mensaje de carga
        console.error('Google login error:', error);
      });
  }
}