import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { HomeComponent } from './home/home.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'Igreja Viva - Início' },
      { 
        path: 'galeria', 
        loadComponent: () => import('./media-gallery/media-gallery.component').then(m => m.PublicMediaGalleryComponent),
        title: 'Galeria - Igreja Viva'
      },
      { 
        path: 'agenda', 
        loadComponent: () => import('./agenda/agenda.component').then(m => m.PublicAgendaComponent),
        title: 'Agenda - Igreja Viva'
      },
      { 
        path: 'mensagens', 
        loadComponent: () => import('./sermons/sermons.component').then(m => m.PublicSermonsComponent),
        title: 'Mensagens - Igreja Viva'
      },
      { 
        path: 'sobre', 
        loadComponent: () => import('./about/about.component').then(m => m.AboutComponent),
        title: 'Sobre Nós - Igreja Viva'
      },
      { 
        path: 'contato', 
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
        title: 'Fale Conosco - Igreja Viva'
      },
      { 
        path: 'lideranca', 
        loadComponent: () => import('./leadership/leadership.component').then(m => m.LeadershipComponent),
        title: 'Nossa Liderança - Igreja Viva'
      },
      { 
        path: 'testemunhos-publico', 
        loadComponent: () => import('./testimonies/public-testimonies.component').then(m => m.PublicTestimoniesComponent),
        title: 'Testemunhos - Igreja Viva'
      },
      { 
        path: 'pedir-oracao', 
        loadComponent: () => import('./prayer-request/prayer-request-form.component').then(m => m.PrayerRequestFormComponent),
        title: 'Pedido de Oração - Igreja Viva'
      },
    ]
  }
];
