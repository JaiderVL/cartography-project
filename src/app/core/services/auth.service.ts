import { Injectable } from '@angular/core'; 
import { Auth, authState, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail, AuthError  } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable que emite el estado del usuario autenticado
  user$: Observable<User | null>;
  // Añadimos un BehaviorSubject para el estado del rol del usuario
  private userRoleSubject = new BehaviorSubject<string>('usuario-invitado');
  userRole$ = this.userRoleSubject.asObservable(); // Observable que pueden usar otros componentes

  constructor(private auth: Auth, private firestore: Firestore, ) {
    // Inicializa el observable del estado del usuario autenticado
    this.user$ = authState(this.auth);

    // Actualizar el rol cuando el estado de autenticación cambia
    this.user$.subscribe(user => {
      if (user) {
        this.getCurrentUserRole().then(role => {
          this.userRoleSubject.next(role!); // Emitir el rol actual
        });
      } else {
        this.userRoleSubject.next('usuario-invitado'); // Si no hay usuario, es "usuario-invitado"
      }
    });
  }

  

  // Observable que emite si el usuario está autenticado o no
  isAuthenticated$: Observable<boolean> = authState(this.auth).pipe(
    map((user) => !!user)
  );

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user) // Retorna true si el usuario está autenticado, false si no
    );
  }
  getCurrentUserId(): string | null {
    const user = this.auth.currentUser;
    return user ? user.uid : null;  // Asegúrate de que el ID se está obteniendo correctamente
  }

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
    try {
      console.log('Intentando registrar usuario...');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Usuario registrado:', userCredential);
  
      const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
      await setDoc(userRef, {
        email,
        role: 'usuario-regular'
      });
  
      console.log('Usuario guardado en Firestore');
      this.userRoleSubject.next('usuario-regular');
      return userCredential;
    } catch (error) {
      console.error('Error durante el registro:', error);
      throw error;
    }
  }

  // Método para iniciar sesión y obtener el rol del usuario
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

    // Obtener el rol del usuario desde Firestore
    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      this.userRoleSubject.next(userData!['role']); // Emitir el rol cuando el usuario inicia sesión
      return { ...userCredential, role: userData['role'] }; // Retorna el rol junto con el userCredential
    }

    throw new Error('User document does not exist in Firestore');
  }
  
  // Método para cerrar sesión
  logout() {
    return signOut(this.auth).then(() => {
      this.userRoleSubject.next('usuario-invitado'); // Emitir "usuario-invitado" al hacer logout
    });
  }
  // // Método para enviar el correo de recuperación con manejo de errores
  // sendPasswordResetEmail(email: string) {
  //   return sendPasswordResetEmail(this.auth, email)
  //     .then(() => {
  //       console.log('Correo de recuperación enviado');
  //       return { success: true, message: 'Correo de recuperación enviado' };
  //     })
  //     .catch((error) => {
  //       console.error('Error al enviar correo de recuperación:', error);
  //       return { success: false, message: error.message };
  //     });
  // }

  async checkIfEmailExists(email: string): Promise<boolean> {
    try {
      // Intentamos enviar el correo directamente
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      throw error; // Relanzamos otros errores
    }
  }

  // Método actualizado para enviar correo de recuperación
  async sendPasswordResetEmail(email: string) {
    try {
      // Verificamos primero si el email existe
      const emailExists = await this.checkIfEmailExists(email);
      
      if (!emailExists) {
        return { 
          success: false, 
          message: 'No existe una cuenta asociada a este correo electrónico.' 
        };
      }
      
      // Si existe, enviamos el correo
      await sendPasswordResetEmail(this.auth, email);
      return { 
        success: true, 
        message: 'Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.' 
      };
    } catch (error: any) {
      console.error('Error al enviar correo de recuperación:', error);
      
      // Mensajes más amigables para errores comunes
      let errorMessage = 'Ocurrió un error al enviar el correo de recuperación.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Por favor intenta más tarde.';
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
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
    this.userRoleSubject.next('usuario-regular'); // Emitir el rol si se registra como usuario-regular
    return { ...userCredential, role: userDoc.exists() ? userDoc.data()!['role'] : 'usuario-regular' };
  }

  // Método para actualizar el rol del usuario (administrador manualmente lo puede cambiar)
  async updateUserRole(uid: string, newRole: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, { role: newRole }, { merge: true }); // Actualiza solo el campo de rol
    this.userRoleSubject.next(newRole); // Emitir el nuevo rol actualizado
  }
}

