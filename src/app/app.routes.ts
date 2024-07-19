import { Routes } from "@angular/router";
import { MainComponent } from "./pages/main/main.component";
import { ActivitiesComponent } from "./pages/activities/activities.component";
import { SavedPlacesComponent } from "./pages/saved-places/saved-places.component";
import { SettingsComponent } from "./pages/settings/settings.component";
import { UserManagerComponent } from "./pages/user-manager/user-manager.component";

export const routes: Routes = [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'main', component: MainComponent},
    {path: 'maps', loadChildren: () => import('./pages/maps/maps.module').then(m => m.MapsModule)},
    {path: 'activities', component: ActivitiesComponent},
    {path: 'saved-places', component: SavedPlacesComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'user-manager', component: UserManagerComponent},
  ];
