import { Routes } from "@angular/router";

import { HomePageComponent } from "./auth/pages/home-page/home-page.component";
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'auth',
    // guards
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'dashboard',
    // guards
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'home', // Nueva ruta para la página de inicio
    component: HomePageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'guest',
  },
  
  ];

  
    // {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    // {path: 'main', component: MainComponent},
    // {path: 'map', component: MapComponent},
    // {path: 'activities', component: ActivitiesComponent},
    // {path: 'saved-places', component: SavedPlacesComponent},
    // {path: 'settings', component: SettingsComponent},
    // {path: 'user-manager', component: UserManagerComponent},
