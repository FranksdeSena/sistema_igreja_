import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-pastor',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Área Pastoral</h1>
          <p class="text-gray-600 mt-2">Gerencie a Palavra do Pastor e os Sermões</p>
        </div>
      </div>

      <!-- Tabs de Navegação -->
      <div class="flex border-b border-gray-200 mb-8">
        <a routerLink="word" 
           routerLinkActive="border-blue-600 text-blue-600"
           class="py-4 px-6 border-b-2 border-transparent hover:text-gray-900 font-medium text-gray-500 transition-colors cursor-pointer">
           Palavra do Pastor
        </a>
        <a routerLink="sermons" 
           routerLinkActive="border-blue-600 text-blue-600"
           class="py-4 px-6 border-b-2 border-transparent hover:text-gray-900 font-medium text-gray-500 transition-colors cursor-pointer">
           Sermões
        </a>
      </div>

      <!-- Conteúdo da Rota Filha -->
      <router-outlet></router-outlet>
    </div>
  `
})
export class PastorComponent {}
