import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['../page.component.css'] // Cambiar styleUrl a styleUrls
})
export class RegisterPageComponent {

     // Define el FormGroup con los campos del formulario
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), // Campo de correo con validaciones
    password: new FormControl('', [Validators.required, Validators.minLength(6)]) // Campo de contraseña con validaciones
  });

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value); // Maneja los datos del formulario
    }
  }

}
