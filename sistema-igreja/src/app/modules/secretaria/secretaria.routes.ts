import { Routes } from '@angular/router';
import { SecretariaLayoutComponent } from './secretaria-layout.component';
import { SecretariaComponent } from './secretaria.component';
import { SecretariaDocumentFormComponent } from './secretaria-document-form.component';
import { SecretariaCommunicationFormComponent } from './secretaria-communication-form.component';
import { SecretariaReportFormComponent } from './secretaria-report-form.component';

export const SECRETARIA_ROUTES: Routes = [
  {
    path: '',
    component: SecretariaLayoutComponent,
    children: [
      {
        path: '',
        component: SecretariaComponent,
      },
      {
        path: 'novo-documento',
        component: SecretariaDocumentFormComponent,
      },
      {
        path: 'editar-documento/:id',
        component: SecretariaDocumentFormComponent,
      },
      {
        path: 'nova-comunicacao',
        component: SecretariaCommunicationFormComponent,
      },
      {
        path: 'editar-comunicacao/:id',
        component: SecretariaCommunicationFormComponent,
      },
      {
        path: 'novo-relatorio',
        component: SecretariaReportFormComponent,
      },
      {
        path: 'editar-relatorio/:id',
        component: SecretariaReportFormComponent,
      },
      {
        path: 'visualizar-relatorio/:id',
        component: SecretariaReportFormComponent,
      },
    ],
  },
];

export default SECRETARIA_ROUTES;
