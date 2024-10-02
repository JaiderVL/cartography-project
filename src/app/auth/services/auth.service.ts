import { Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore'; // Importa Firestore
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  constructor(private auth: Auth, private firestore: Firestore) {} // Añade Firestore aquí

  // Observable que emite el estado de autenticación
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
  
        return userData ? userData['role'] : null; // Retorna el rol o null si no existe
      }
  
      return null;
    }

  // Método para registrar un usuario y añadir su rol a Firestore
  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    // Después de crear el usuario, guarda su información en Firestore con el rol 'usuario_normal'
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userRef, {
      email,
      role: 'usuario_normal' // Rol por defecto al registrarse
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

    // Si el usuario no tiene un documento, crear uno con rol 'usuario_normal'
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: userCredential.user.email,
        role: 'usuario_normal'
      });
    }

    return userCredential;
  }
}
