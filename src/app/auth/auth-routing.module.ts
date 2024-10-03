import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { LoginComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { GuestPageComponent } from './pages/guest-page/guest-page.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    // canActivate: [NoAuthGuard] // Solo usuario-invitado puede acceder
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    // canActivate: [NoAuthGuard] // Solo usuario-invitado puede acceder
  },
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [AuthGuard] // Solo usuario-regular, moderador, y administrador pueden acceder
  },
  {
    path: 'admin',
    component: AdminPageComponent, // Cambia a tu componente de administración
    canActivate: [AdminGuard] // Solo administrador puede acceder
  },
  {
    path: 'guest',
    component: GuestPageComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: '**',
    redirectTo: 'guest'
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
