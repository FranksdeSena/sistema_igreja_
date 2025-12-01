import { Routes } from '@angular/router';
import { MediaListComponent } from './media-list/media-list.component';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { MediaDetailComponent } from './media-detail/media-detail.component';

export const MEDIA_ROUTES: Routes = [
  {
    path: '',
    component: MediaListComponent,
    title: 'Gerenciar Mídias'
  },
  {
    path: 'upload',
    component: MediaUploadComponent,
    title: 'Upload de Mídia'
  },
  {
    path: ':id',
    component: MediaDetailComponent,
    title: 'Detalhes da Mídia'
  }
];
