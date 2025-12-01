import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MediaDatabaseService } from '../../../core/services/media-database.service';
import { MediaItem } from '../../../shared/models/media.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, debounceTime, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Galeria de Mídias</h1>
          <p class="text-gray-600">Gerencie fotos e vídeos da igreja</p>
        </div>
        <a
          routerLink="upload"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span class="mr-2">📤</span> Novo Upload
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-1 w-full">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              🔍
            </span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar por título..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
          <select
            [(ngModel)]="filterType"
            (ngModelChange)="onFilterChange()"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Todos os Tipos</option>
            <option value="photo">Fotos</option>
            <option value="video">Vídeos</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" *ngIf="!(loading$ | async)">
        <div
          *ngFor="let item of filteredMedia$ | async"
          class="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200"
        >
          <!-- Thumbnail -->
          <div class="aspect-video relative bg-gray-100 cursor-pointer" [routerLink]="[item.id]">
            <img
              *ngIf="item.type === 'photo'"
              [src]="item.thumbnailUrl || item.mediaUrl"
              [alt]="item.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <video
              *ngIf="item.type === 'video'"
              [src]="item.mediaUrl"
              class="w-full h-full object-cover"
            ></video>
            
            <!-- Video Indicator -->
            <div
              *ngIf="item.type === 'video'"
              class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
            >
              <span class="text-3xl text-white opacity-80 group-hover:opacity-100">▶️</span>
            </div>

            <!-- Duration Badge -->
            <span
              *ngIf="item.duration"
              class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
            >
              {{ formatDuration(item.duration) }}
            </span>
          </div>

          <!-- Info -->
          <div class="p-3">
            <h3 class="text-sm font-medium text-gray-900 truncate" [title]="item.title">
              {{ item.title || 'Sem título' }}
            </h3>
            <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{{ item.createdAt | date:'dd/MM/yyyy' }}</span>
              <div class="flex gap-2">
                <span title="Visualizações">👁️ {{ item.views || 0 }}</span>
                <span title="Curtidas">❤️ {{ item.likes || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              (click)="onLike(item.id, $event)"
              class="p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm"
              title="Curtir"
            >
              ❤️
            </button>
            <button
              (click)="onDelete(item.id, $event)"
              class="p-1.5 bg-white/90 text-red-600 rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm"
              title="Excluir"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="(filteredMedia$ | async)?.length === 0 && !(loading$ | async)"
        class="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300"
      >
        <p class="text-4xl mb-4">📷</p>
        <h3 class="text-lg font-medium text-gray-900">Nenhuma mídia encontrada</h3>
        <p class="text-gray-500 mt-1">Tente ajustar os filtros ou faça um novo upload.</p>
        <a
          routerLink="upload"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Fazer Upload
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class MediaListComponent implements OnInit {
  mediaItems$ = new BehaviorSubject<MediaItem[]>([]);
  loading$ = new BehaviorSubject<boolean>(true);
  
  searchTerm = '';
  filterType = 'all';
  
  filteredMedia$: Observable<MediaItem[]>;

  constructor(private mediaService: MediaDatabaseService) {
    this.filteredMedia$ = combineLatest([
      this.mediaItems$,
      new BehaviorSubject(this.searchTerm), // TODO: Reactive search
      new BehaviorSubject(this.filterType)  // TODO: Reactive filter
    ]).pipe(
      map(([items, search, type]) => {
        return items.filter(item => {
          const matchesSearch = !this.searchTerm || 
            (item.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false);
          const matchesType = this.filterType === 'all' || item.type === this.filterType;
          return matchesSearch && matchesType;
        });
      })
    );
  }

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.loading$.next(true);
    this.mediaService.getMedia().subscribe({
      next: (items) => {
        this.mediaItems$.next(items);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Erro ao carregar mídias:', err);
        this.loading$.next(false);
      }
    });
  }

  onSearch(term: string): void {
    // Trigger pipe update
    this.mediaItems$.next(this.mediaItems$.value);
  }

  onFilterChange(): void {
    // Trigger pipe update
    this.mediaItems$.next(this.mediaItems$.value);
  }

  async onLike(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    await this.mediaService.likeMedia(id);
  }

  async onDelete(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Tem certeza que deseja excluir esta mídia?')) {
      await this.mediaService.deleteMedia(id);
    }
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
