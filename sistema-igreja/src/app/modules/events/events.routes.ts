import { Routes } from '@angular/router';
import { EventsComponent } from './events.component';
import { EventFormComponent } from './event-form.component';

export const EVENTS_ROUTES: Routes = [
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
];

export default EVENTS_ROUTES;
