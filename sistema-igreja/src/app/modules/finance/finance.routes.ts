import { Routes } from '@angular/router';
import { FinanceLayoutComponent } from './finance-layout.component';
import { FinanceComponent } from './finance.component';
import { FinanceFormComponent } from './finance-form.component';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    component: FinanceLayoutComponent,
    children: [
      {
        path: '',
        component: FinanceComponent,
      },
      {
        path: 'novo',
        component: FinanceFormComponent,
      },
      {
        path: 'editar/:id',
        component: FinanceFormComponent,
      },
    ],
  },
];

export default FINANCE_ROUTES;
