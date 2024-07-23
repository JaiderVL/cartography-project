import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) {}

  // Método para obtener todos los usuarios
  getUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of([]); // Retorna un array vacío en caso de error
      })
    ) as Observable<User[]>;
  }

  // Método para eliminar un usuario por su ID
  deleteUser(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(userDocRef);
  }

  // Método para crear un nuevo usuario
  createUser(user: User): Promise<void> {
    const usersCollection = collection(this.firestore, 'users');
    return addDoc(usersCollection, user).then(() => {
      console.log('User created successfully');
    }).catch(error => {
      console.error('Error creating user: ', error);
    });
  }

  // Método para actualizar un usuario existente
  updateUser(user: User): Promise<void> {
    if (!user.id) {
      return Promise.reject(new Error('User ID is required'));
    }
    const userDocRef = doc(this.firestore, `users/${user.id}`);
    return setDoc(userDocRef, user).then(() => {
      console.log('User updated successfully');
    }).catch(error => {
      console.error('Error updating user: ', error);
    });
  }
}
