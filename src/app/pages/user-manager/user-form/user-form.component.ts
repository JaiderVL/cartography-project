import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'] // Corrección: styleUrl -> styleUrls
})
export class UserFormComponent implements OnChanges {
  @Input() user: User = {
    id: this.generateId(),
    name: '',
    lastname: '',
    email: '',
    password: '',
    zone: '',
    rol: ''
  };

  @Input() isEditMode: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.isEditMode) {
      this.user = { ...this.user };
    }
  }

  generateId(): string { // Corrección: generar ID como cadena
    return Math.random().toString(36).substr(2, 9);
  }

  onSubmit(form: NgForm): void {
    if (this.isEditMode) {
      this.userService.updateUser(this.user).then(() => {
        Swal.fire({
          title: "Usuario actualizado!",
          text: "El usuario ha sido actualizado con éxito.",
          icon: "success"
        });
        this.closeModal.emit();
        form.resetForm();
      }).catch((error) => {
        Swal.fire({
          title: "Error!",
          text: "Hubo un problema al actualizar el usuario..",
          icon: "error"
        });
        console.error('Error updating user: ', error);
      });
    } else {
      this.userService.createUser(this.user).then(() => {
        Swal.fire({
          title: "Usuario Creado!",
          text: "El usuario ha sido creado con éxito.",
          icon: "success"
        });
        form.resetForm();
        this.closeModal.emit();
      }).catch((error) => {
        Swal.fire({
          title: "Error!",
          text: "Hubo un problema al crear el usuario.",
          icon: "error"
        });
        console.error('Error creating user: ', error);
      });
    }
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.user = {
      id: this.generateId(), // Corrección: generar ID como cadena
      name: '',
      lastname: '',
      email: '',
      password: '',
      zone: '',
      rol: ''
    };
    this.isEditMode = false;
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
