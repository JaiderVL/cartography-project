import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
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

