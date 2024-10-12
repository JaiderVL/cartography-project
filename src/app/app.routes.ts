import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'auth',  // Esta es la ruta que carga el módulo de autenticación
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' // Redirige automáticamente a 'home' si la ruta está vacía
  },
  {
    path: '**',
    redirectTo: 'home' // Redirige a 'home' si la ruta no es válida
  }
];
