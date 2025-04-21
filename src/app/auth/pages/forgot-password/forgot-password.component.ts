

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  // imports: [FormsModule,,],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../page.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Ya no es necesario inicializar forgotPasswordForm aquí, ya que se hace en la declaración.
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;
    
    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email;

    this.authService.sendPasswordResetEmail(email)
      .then(() => {
        alert('Correo de recuperación enviado');
      })
      .catch((error) => {
        this.errorMessage = error.message;
        alert('Error: ' + this.errorMessage);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
