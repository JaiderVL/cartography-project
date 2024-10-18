import { Routes } from '@angular/router';
import { HomePageComponent } from './home/home-page/home-page.component';
import { MapComponent } from './pages/map/map.component';
import { ActivitiesComponent } from './pages/activities/activities.component';
import { SavedPlacesComponent } from './pages/saved-places/saved-places.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { MainComponent } from './pages/main/main.component';



export const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
    children: [
      { path: 'main', component: MainComponent },
      { path: 'map', component: MapComponent },
      { path: 'activities', component: ActivitiesComponent },
      { path: 'saved-places', component: SavedPlacesComponent },
      { path: 'admin-page', component: AdminPageComponent },
      { path: '', redirectTo: 'main', pathMatch: 'full' }
      
    ]
  },
  {
    path: 'auth',  // Carga lazily el módulo de autenticación
    loadChildren: () => import('./auth/auth-routing.module').then(m => m.AuthRoutingModule),
  },
  {
    path: '',
    redirectTo: 'home/main', // Redirige automáticamente a 'main' dentro de 'home' si la ruta está vacía
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home/main' // Redirige a 'main' si la ruta no es válida
  }
];
