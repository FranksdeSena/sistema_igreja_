import { Routes } from '@angular/router';
import { EventsLayoutComponent } from './events-layout.component';
import { EventsComponent } from './events.component';
import { EventFormComponent } from './event-form.component';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    component: EventsLayoutComponent,
    children: [
      {
        path: '',
        component: EventsComponent,
      },
      {
        path: 'novo',
        component: EventFormComponent,
      },
      {
        path: 'editar/:id',
        component: EventFormComponent,
      },
    ],
  },
];

export default EVENTS_ROUTES;
