import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { LoginComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';

const routes: Routes = [

  {
      path: '',
      component:AuthlayoutComponent,
      children: [
        {path: 'login',component:LoginComponent},
        {path: 'register',component:RegisterPageComponent},
        {path: '**',redirectTo: 'login'},
      ]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
