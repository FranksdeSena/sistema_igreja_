import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { DashboardHomeComponent } from './dashboard-home.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
      },
      {
        path: 'membros',
        loadComponent: () => import('../members/members.component').then(m => m.MembersComponent)
      },
      {
        path: 'membros/novo',
        loadComponent: () => import('../members/member-form.component').then(m => m.MemberFormComponent)
      },
      {
        path: 'membros/editar/:id',
        loadComponent: () => import('../members/member-form.component').then(m => m.MemberFormComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('../admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'usuarios/novo',
        loadComponent: () => import('../admin/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () => import('../admin/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'financeiro',
        loadComponent: () => import('../finance/finance.component').then(m => m.FinanceComponent)
      },
      {
        path: 'financeiro/novo',
        loadComponent: () => import('../finance/finance-form.component').then(m => m.FinanceFormComponent)
      },
      {
        path: 'financeiro/editar/:id',
        loadComponent: () => import('../finance/finance-form.component').then(m => m.FinanceFormComponent)
      },
      {
        path: 'eventos',
        loadComponent: () => import('../events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'eventos/novo',
        loadComponent: () => import('../events/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'eventos/editar/:id',
        loadComponent: () => import('../events/event-form.component').then(m => m.EventFormComponent)
      },
    ],
  },
];

export default DASHBOARD_ROUTES;
