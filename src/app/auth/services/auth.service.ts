import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private readonly baseUrl: string = environment.baseUrl;
  private http = inject(HttpClient);

  // private _currentUser =  signal<User|null>(null);
  // private _authStatus = signal <AuthStatus>();
  

  constructor() { }

  Login(email:string, password:string): Observable<boolean>{



    return of(true);
  }

}
