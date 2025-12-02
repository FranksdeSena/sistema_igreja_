import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { sessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/public/public.routes').then(m => m.PUBLIC_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard').then(m => m.DASHBOARD_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'members',
    loadChildren: () => import('./modules/members').then(m => m.MEMBERS_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'finance',
    loadChildren: () => import('./modules/finance').then(m => m.FINANCE_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'events',
    loadChildren: () => import('./modules/events').then(m => m.EVENTS_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'pastor',
    loadChildren: () => import('./modules/pastor').then(m => m.PASTOR_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'secretaria',
    loadChildren: () => import('./modules/secretaria').then(m => m.SECRETARIA_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'testemunhos',
    loadChildren: () => import('./modules/testimonies/testimonies.routes').then(m => m.TESTIMONIES_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
  {
    path: 'pedidos-oracao',
    loadChildren: () => import('./modules/prayer-requests/prayer-requests.routes').then(m => m.PRAYER_REQUESTS_ROUTES),
    canActivate: [AuthGuard, sessionGuard],
  },
];
