import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importa el AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['../page.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password)
        .then(() => {
          console.log('User logged in');
            this.router.navigate(['/home'], { replaceUrl: true }); // Reemplaza la entrada de historial
        })
        .catch(error => console.error('Login error:', error));
    }
  }
  loginWithGoogle() {
    this.authService.loginWithGoogle()
      .then(() => {
        console.log('User logged in with Google');
        this.router.navigate(['/home'], { replaceUrl: true }); // Reemplaza la entrada de historial
      })
      .catch(error => console.error('Google login error:', error));
  }
}
