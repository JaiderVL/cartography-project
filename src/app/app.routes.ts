import { Routes } from "@angular/router";
import { MainComponent } from "./pages/main/main.component";
import { ActivitiesComponent } from "./pages/activities/activities.component";
import { SavedPlacesComponent } from "./pages/saved-places/saved-places.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { UserManagerComponent } from "./pages/user-manager/user-manager.component";
import { MapComponent } from "./pages/map/map.component";

export const routes: Routes = [

  {
    path:'auth',
    // guards
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path:'dashboard',
    // guards
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path:'**',
  redirectTo: 'auth'
  },

    // {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    // {path: 'main', component: MainComponent},
    // {path: 'map', component: MapComponent},
    // {path: 'activities', component: ActivitiesComponent},
    // {path: 'saved-places', component: SavedPlacesComponent},
    // {path: 'settings', component: SettingsComponent},
    // {path: 'user-manager', component: UserManagerComponent},
  ];
