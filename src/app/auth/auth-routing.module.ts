import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
// import { NoAuthGuard } from './guards/no-auth.guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomePageComponent } from '../home/home-page/home-page.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    // Dejar así si mantienes el login como parte de autenticación
  },
  {
    path: 'register',
    component: RegisterPageComponent,
  },
  {
    path: 'home',
    component: HomePageComponent, // Asegúrate de que 'home' esté accesible
  },
  {
    path: 'forgot-password', // Nueva ruta para la página de recuperación de contraseña
    component: ForgotPasswordComponent,
  },
  {
    path: '**',
    redirectTo: '/home', // Redirige cualquier ruta no válida a 'home'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
