import { Injectable } from '@angular/core'; 
import { Auth, authState, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';  // Importa HttpClient para realizar solicitudes HTTP
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  private userRoleSubject = new BehaviorSubject<string>('usuario-invitado');
  userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private auth: Auth, 
    private firestore: Firestore, 
    private http: HttpClient // Añadido para realizar solicitudes HTTP
  ) {
    this.user$ = authState(this.auth);
    this.user$.subscribe(user => {
      if (user) {
        this.getCurrentUserRole().then(role => {
          this.userRoleSubject.next(role!);
        });
      } else {
        this.userRoleSubject.next('usuario-invitado');
      }
    });
  }

  isAuthenticated$ = authState(this.auth).pipe(map((user) => !!user));

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  async getCurrentUserRole(): Promise<string | null> {
    const user = this.auth.currentUser;
  
    if (user) {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      return userData ? userData['role'] : 'usuario-invitado';
    }
  
    return 'usuario-invitado';
  }

  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userRef, {
      email,
      role: 'usuario-regular' 
    });

    this.userRoleSubject.next('usuario-regular');
    return userCredential;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      this.userRoleSubject.next(userData!['role']);
      return { ...userCredential, role: userData['role'] };
    }

    throw new Error('User document does not exist in Firestore');
  }

  logout() {
    return signOut(this.auth).then(() => {
      this.userRoleSubject.next('usuario-invitado');
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);

    const userRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: userCredential.user.email,
        role: 'usuario-regular'
      });
    }

    this.userRoleSubject.next('usuario-regular');
    return { ...userCredential, role: userDoc.exists() ? userDoc.data()!['role'] : 'usuario-regular' };
  }

  async updateUserRole(uid: string, newRole: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, { role: newRole }, { merge: true });
    this.userRoleSubject.next(newRole);
  }

  // Método para enviar una solicitud a Cloud Function y eliminar el usuario de Firebase Auth
  deleteUserFromAuth(uid: string): Promise<any> {
    const url = 'URL_DE_TU_CLOUD_FUNCTION'; // Debes reemplazar con la URL de tu función de Firebase
    return this.http.post(url, { uid }).toPromise();
  }
}
