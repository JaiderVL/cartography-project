import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    FormsModule,CommonModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  users: any[] = []; // Lista de usuarios
  selectedRole: string = ''; // Nuevo rol seleccionado

  constructor(private authService: AuthService, private firestore: Firestore) {}

  ngOnInit() {
    this.loadUsers(); // Cargar usuarios al inicializar
  }

  // Cargar todos los usuarios de la colección 'users'
  async loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    this.users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  }

  // Cambiar el rol de un usuario
  changeUserRole(uid: string, newRole: string) {
    this.authService.updateUserRole(uid, newRole)
      .then(() => {
        console.log(`Rol de usuario ${uid} cambiado a ${newRole}`);
        this.loadUsers(); // Recargar lista de usuarios después de actualizar
      })
      .catch(error => console.error('Error al cambiar el rol:', error));
  }
}
