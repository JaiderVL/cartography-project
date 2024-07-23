import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asegúrate de que esta ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

}
