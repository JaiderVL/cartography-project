import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, collection, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  users: any[] = []; 
  filteredUsers: any[] = []; 
  selectedRole: string = ''; 
  searchTerm: string = ''; 
  selectedRoleFilter: string = ''; 
  isMobileView: boolean = false; 

  constructor(private authService: AuthService, private firestore: Firestore) {}

  ngOnInit() {
    this.loadUsers();
    this.checkMobileView();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobileView();
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  async loadUsers() {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    this.users = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ uid: doc.id, ...doc.data() }));
    this.filteredUsers = [...this.users];
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      (this.selectedRoleFilter ? user.role === this.selectedRoleFilter : true) &&
      (this.searchTerm ? user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) : true)
    );
  }

  changeUserRole(uid: string, newRole: string) {
    this.authService.updateUserRole(uid, newRole)
      .then(() => this.loadUsers())
      .catch(error => console.error('Error al cambiar el rol:', error));
  }

  async deleteUser(uid: string) {
    try {
      await deleteDoc(doc(this.firestore, `users/${uid}`));
      this.loadUsers();
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  }
}
