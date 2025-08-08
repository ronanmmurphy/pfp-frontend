// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./domains/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./domains/users/users.component').then((c) => c.UsersComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'sessions',
        loadComponent: () => import('./domains/sessions/sessions.component').then((c) => c.SessionsComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./core/auth/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
