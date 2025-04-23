// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../page.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  async onSubmit(): Promise<void> {
    // Validar formulario
    if (this.forgotPasswordForm.invalid) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const email = this.forgotPasswordForm.value.email;

    try {
      const result = await this.authService.sendPasswordResetEmail(email);
      
      if (result.success) {
        this.successMessage = result.message;
        // Opcional: limpiar el formulario después de éxito
        this.forgotPasswordForm.reset();
      } else {
        this.errorMessage = result.message;
      }
    } catch (error: any) {
      console.error('Error inesperado:', error);
      this.errorMessage = 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }
}