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
    ],
  },
];

export default DASHBOARD_ROUTES;
