import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'members',
    loadChildren: () => import('./modules/members').then(m => m.MEMBERS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'finance',
    loadChildren: () => import('./modules/finance').then(m => m.FINANCE_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events').then(m => m.EVENTS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'pastor',
    loadChildren: () => import('./modules/pastor').then(m => m.PASTOR_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'secretaria',
    loadChildren: () => import('./modules/secretaria').then(m => m.SECRETARIA_ROUTES),
    canActivate: [AuthGuard],
  },
];
