import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';

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
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then((c) => c.UsersComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'sessions',
        loadComponent: () => import('./pages/sessions/sessions.component').then((c) => c.SessionsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'onboarding',
        loadComponent: () => import('./pages/onboarding/onboarding.component').then((c) => c.OnboardingComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then((c) => c.ProfileComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
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
