import { Routes } from '@angular/router';
import { TestimoniesComponent } from './testimonies.component';
import { TestimonyFormComponent } from './testimony-form.component';

export const TESTIMONIES_ROUTES: Routes = [
  { path: '', component: TestimoniesComponent },
  { path: 'novo', component: TestimonyFormComponent }
];
