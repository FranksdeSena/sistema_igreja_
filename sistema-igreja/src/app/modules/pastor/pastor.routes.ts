import { Routes } from '@angular/router';
import { PastorLayoutComponent } from './pastor-layout.component';
import { PastorComponent } from './pastor.component';
import { PastorSermonFormComponent } from './pastor-sermon-form.component';
import { PastorVisitFormComponent } from './pastor-visit-form.component';
import { MediaGalleryComponent } from './components/media-gallery/media-gallery.component';

export const PASTOR_ROUTES: Routes = [
  {
    path: '',
    component: PastorLayoutComponent,
    children: [
      {
        path: '',
        component: PastorComponent,
      },
      {
        path: 'novo-sermao',
        component: PastorSermonFormComponent,
      },
      {
        path: 'editar-sermao/:id',
        component: PastorSermonFormComponent,
      },
      {
        path: 'nova-visita',
        component: PastorVisitFormComponent,
      },
      {
        path: 'editar-visita/:id',
        component: PastorVisitFormComponent,
      },
      {
        path: 'galeria',
        component: MediaGalleryComponent,
      },
    ],
  },
];

export default PASTOR_ROUTES;
