import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { PastorDatabaseService } from '../../core/services/pastor-database.service';
import { Sermon } from '../../shared/models/pastor.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sermons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header com Botão Novo -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Sermões e Pregações</h2>
        <a routerLink="new" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Novo Sermão
        </a>
      </div>

      <!-- Lista de Sermões -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let sermon of sermons$ | async" class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{{ sermon.date | date:'dd/MM/yyyy' }}</span>
              <div class="flex space-x-2">
                <button (click)="editSermon(sermon)" class="text-gray-400 hover:text-blue-500 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button (click)="deleteSermon(sermon)" class="text-gray-400 hover:text-red-500 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{{ sermon.title }}</h3>
            
            <div class="space-y-2 text-sm text-gray-600">
              <p class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                {{ sermon.preacher }}
              </p>
              <p *ngIf="sermon.series" class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Série: {{ sermon.series }}
              </p>
              <p *ngIf="sermon.scriptureReference" class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                {{ sermon.scriptureReference }}
              </p>
            </div>

            <div *ngIf="sermon.mediaUrl" class="mt-4 pt-4 border-t border-gray-100">
              <a [href]="sermon.mediaUrl" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Ver/Ouvir Sermão
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div *ngIf="(sermons$ | async)?.length === 0" class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum sermão cadastrado</h3>
        <p class="mt-1 text-sm text-gray-500">Comece adicionando um novo sermão ou pregação.</p>
        <div class="mt-6">
          <a routerLink="new" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Novo Sermão
          </a>
        </div>
      </div>
    </div>
  `
})
export class SermonsComponent implements OnInit {
  private pastorService = inject(PastorDatabaseService);
  sermons$: Observable<Sermon[]> = this.pastorService.getSermons();

  ngOnInit() {}

  private router = inject(Router);

  editSermon(sermon: Sermon) {
    this.router.navigate(['dashboard', 'pastor', 'sermons', 'edit', sermon.id]);
  }

  async deleteSermon(sermon: Sermon) {
    if (confirm(`Tem certeza que deseja excluir o sermão "${sermon.title}"?`)) {
      try {
        await this.pastorService.deleteSermon(sermon.id);
      } catch (error) {
        console.error('Erro ao excluir sermão:', error);
        alert('Erro ao excluir. Tente novamente.');
      }
    }
  }
}
