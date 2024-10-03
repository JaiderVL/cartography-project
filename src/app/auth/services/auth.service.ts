import { Injectable } from '@angular/core';
import { Auth, authState, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable que emite el estado del usuario autenticado
  user$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    // Inicializa el observable del estado del usuario autenticado
    this.user$ = authState(this.auth);
  }

  // Observable que emite si el usuario está autenticado o no
  isAuthenticated$: Observable<boolean> = authState(this.auth).pipe(
    map((user) => !!user)
  );

  // Método para obtener el rol del usuario actual
  async getCurrentUserRole(): Promise<string | null> {
    const user = this.auth.currentUser;
  
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
  
      return userData ? userData['role'] : 'usuario-invitado'; // Retorna el rol o 'usuario-invitado' si no existe
    }
  
    return 'usuario-invitado';
  }

  // Registro con rol predeterminado 'usuario-regular'
  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    // Guardar la información del usuario con el rol 'usuario-regular'
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userRef, {
      email,
      role: 'usuario-regular' // Rol por defecto al registrarse
    });

    return userCredential;
  }

  // Método para iniciar sesión y obtener el rol del usuario
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

    // Obtener el rol del usuario desde Firestore
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { ...userCredential, role: userData['role'] }; // Retorna el rol junto con el userCredential
    }

    throw new Error('User document does not exist in Firestore');
  }

  // Método para cerrar sesión
  logout() {
    return signOut(this.auth);
  }

  // Método para iniciar sesión con Google
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);

    // Obtener el rol del usuario desde Firestore
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userRef);

    // Si el usuario no tiene un documento, crear uno con rol 'usuario-regular'
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: userCredential.user.email,
        role: 'usuario-regular'
      });
    }

    // Si existe, devolver el rol
    return { ...userCredential, role: userDoc.exists() ? userDoc.data()!['role'] : 'usuario-regular' };
  }

  // Método para actualizar el rol del usuario (administrador manualmente lo puede cambiar)
  async updateUserRole(uid: string, newRole: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, { role: newRole }, { merge: true }); // Actualiza solo el campo de rol
  }
}
