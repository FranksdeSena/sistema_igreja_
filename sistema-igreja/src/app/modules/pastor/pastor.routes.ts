import { Routes } from '@angular/router';
import { PastorComponent } from './pastor.component';
import { PastorWordFormComponent } from './pastor-word-form.component';
import { SermonsComponent } from './sermons.component';
import { SermonFormComponent } from './sermon-form.component';

export const PASTOR_ROUTES: Routes = [
  {
    path: '',
    component: PastorComponent,
    children: [
      { path: '', redirectTo: 'word', pathMatch: 'full' },
      { path: 'word', component: PastorWordFormComponent },
      { path: 'sermons', component: SermonsComponent },
      { path: 'sermons/new', component: SermonFormComponent },
      { path: 'sermons/edit/:id', component: SermonFormComponent }
    ]
  }
];
