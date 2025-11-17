import { Routes } from '@angular/router';
import { MembersLayoutComponent } from './members-layout.component';
import { MembersComponent } from './members.component';
import { MemberFormComponent } from './member-form.component';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    component: MembersLayoutComponent,
    children: [
      {
        path: '',
        component: MembersComponent,
      },
      {
        path: 'novo',
        component: MemberFormComponent,
      },
      {
        path: 'editar/:id',
        component: MemberFormComponent,
      },
    ],
  },
];

export default MEMBERS_ROUTES;
