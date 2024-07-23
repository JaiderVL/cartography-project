import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../core/models/user';
import { Observable } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import Swal from 'sweetalert2';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, UserFormComponent],
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css'] // Corrección: styleUrl -> styleUrls
})
export class UserManagerComponent implements OnInit {
  users$: Observable<User[]>;
  searchTerm: string = '';
  showModal: boolean = false;
  selectedUser: User;
  isEditMode: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.users$ = this.userService.getUsers();
  }

generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

  trackById(index: number, user: User): string { // Corrección: tipo de ID debe ser string
    return user.id;
  }

  removeUser(userId: string): void { // Corrección: tipo de ID debe ser string
    Swal.fire({
      title: "¿Seguro que quiere eliminar?",
      text: "Cuidado el usuario será eliminado del sistema!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí"
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).then(() => {
          Swal.fire({
            title: "Eliminado!",
            text: "Usuario eliminado con éxito.",
            icon: "success"
          });
          this.users$ = this.userService.getUsers();
        }).catch((error) => {
          Swal.fire({
            title: "Error!",
            text: "Hubo un problema al eliminar el usuario.",
            icon: "error"
          });
          console.error(`Error deleting user with id ${userId}: `, error);
        });
      }
    });
  }

  updateUser(user: User) {
    this.selectedUser = { ...user };
    this.isEditMode = true;
    this.showModal = true;
  }

  openCreateUserModal() {
    this.selectedUser = {
      id: this.generateId(),
      name: '',
      lastname: '',
      email: '',
      password: '',
      zone: '',
      rol: ''
    };
    this.isEditMode = false;
    this.showModal = true;
  }

  closeCreateUserModal() {
    this.showModal = false;
  }
}
