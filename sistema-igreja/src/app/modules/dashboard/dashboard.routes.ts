import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard-home.component').then(m => m.DashboardHomeComponent),
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
        path: 'aniversariantes',
        loadComponent: () => import('../birthdays/birthdays.component').then(m => m.BirthdaysComponent)
      },
      {
        path: 'celulas',
        loadComponent: () => import('../cells/cells.component').then(m => m.CellsComponent)
      },
      {
        path: 'celulas/nova',
        loadComponent: () => import('../cells/cell-form.component').then(m => m.CellFormComponent)
      },
      {
        path: 'celulas/editar/:id',
        loadComponent: () => import('../cells/cell-form.component').then(m => m.CellFormComponent)
      },
      {
        path: 'celulas/:id',
        loadComponent: () => import('../cells/cell-details.component').then(m => m.CellDetailsComponent)
      },
      {
        path: 'ministerios',
        loadComponent: () => import('../ministries/ministries.component').then(m => m.MinistriesComponent)
      },
      {
        path: 'ministerios/novo',
        loadComponent: () => import('../ministries/ministry-form.component').then(m => m.MinistryFormComponent)
      },
      {
        path: 'ministerios/editar/:id',
        loadComponent: () => import('../ministries/ministry-form.component').then(m => m.MinistryFormComponent)
      },
      {
        path: 'ministerios/:id',
        loadComponent: () => import('../ministries/ministry-details.component').then(m => m.MinistryDetailsComponent)
      },
      {
        path: 'financeiro',
        loadComponent: () => import('../finance/finance.component').then(m => m.FinanceComponent)
      },
      {
        path: 'eventos',
        loadChildren: () => import('../events/events.routes').then(m => m.EVENTS_ROUTES)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('../admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'auditoria',
        loadComponent: () => import('../audit/audit.component').then(m => m.AuditComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'auditoria/:id',
        loadComponent: () => import('../audit/audit-details.component').then(m => m.AuditDetailsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'pastor',
        loadChildren: () => import('../pastor/pastor.routes').then(m => m.PASTOR_ROUTES)
      },
      {
        path: 'media',
        loadChildren: () => import('../media/media.routes').then(m => m.MEDIA_ROUTES)
      },
    ],
  },
];

export default DASHBOARD_ROUTES;
