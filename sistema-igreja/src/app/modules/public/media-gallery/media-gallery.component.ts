import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaDatabaseService } from '../../../core/services/media-database.service';
import { MediaItem } from '../../../shared/models/media.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-public-media-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Galeria de Fotos e Vídeos</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Confira os melhores momentos da nossa comunidade.
          </p>
        </div>

        <!-- Filters -->
        <div class="flex justify-center mb-8">
          <div class="bg-white p-1 rounded-lg shadow-sm inline-flex">
            <button
              (click)="setFilter('all')"
              [class.bg-primary-blue]="filterType === 'all'"
              [class.text-white]="filterType === 'all'"
              [class.text-gray-600]="filterType !== 'all'"
              class="px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Todos
            </button>
            <button
              (click)="setFilter('photo')"
              [class.bg-primary-blue]="filterType === 'photo'"
              [class.text-white]="filterType === 'photo'"
              [class.text-gray-600]="filterType !== 'photo'"
              class="px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Fotos
            </button>
            <button
              (click)="setFilter('video')"
              [class.bg-primary-blue]="filterType === 'video'"
              [class.text-white]="filterType === 'video'"
              [class.text-gray-600]="filterType !== 'video'"
              class="px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Vídeos
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading$ | async" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" *ngIf="!(loading$ | async)">
          <div
            *ngFor="let item of filteredMedia$ | async"
            class="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            (click)="openLightbox(item)"
          >
            <!-- Thumbnail -->
            <div class="aspect-square relative overflow-hidden">
              <img
                *ngIf="item.type === 'photo'"
                [src]="item.thumbnailUrl || item.mediaUrl"
                [alt]="item.title"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <video
                *ngIf="item.type === 'video'"
                [src]="item.mediaUrl"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              ></video>
              
              <!-- Overlay Gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <!-- Video Indicator -->
              <div
                *ngIf="item.type === 'video'"
                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
              >
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                  <span class="text-2xl text-white ml-1">▶️</span>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="text-white font-medium truncate text-shadow">{{ item.title }}</h3>
              <div class="flex items-center gap-3 text-white/90 text-sm mt-1">
                <span>👁️ {{ item.views || 0 }}</span>
                <span>❤️ {{ item.likes || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="(filteredMedia$ | async)?.length === 0 && !(loading$ | async)"
          class="text-center py-20"
        >
          <p class="text-6xl mb-4">📷</p>
          <h3 class="text-xl font-medium text-gray-900">Nenhuma mídia encontrada</h3>
          <p class="text-gray-500 mt-2">Em breve teremos novidades por aqui!</p>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div
        *ngIf="selectedItem"
        class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
        (click)="closeLightbox()"
      >
        <button
          class="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          (click)="closeLightbox()"
        >
          <span class="text-4xl">×</span>
        </button>

        <div class="max-w-5xl w-full max-h-[90vh] flex flex-col items-center" (click)="$event.stopPropagation()">
          <!-- Media Content -->
          <div class="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl">
            <img
              *ngIf="selectedItem.type === 'photo'"
              [src]="selectedItem.mediaUrl"
              [alt]="selectedItem.title"
              class="max-w-full max-h-[80vh] object-contain"
            />
            <video
              *ngIf="selectedItem.type === 'video'"
              [src]="selectedItem.mediaUrl"
              controls
              autoplay
              class="max-w-full max-h-[80vh]"
            ></video>
          </div>

          <!-- Media Details -->
          <div class="mt-4 text-center text-white">
            <h2 class="text-2xl font-bold mb-2">{{ selectedItem.title }}</h2>
            <p class="text-gray-300 max-w-2xl mx-auto">{{ selectedItem.description }}</p>
            <div class="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400">
              <span>📅 {{ selectedItem.createdAt | date:'dd/MM/yyyy' }}</span>
              <span>👁️ {{ selectedItem.views || 0 }} visualizações</span>
              <span>❤️ {{ selectedItem.likes || 0 }} curtidas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-shadow {
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
  `]
})
export class PublicMediaGalleryComponent implements OnInit {
  mediaItems$ = new BehaviorSubject<MediaItem[]>([]);
  loading$ = new BehaviorSubject<boolean>(true);
  filterType = 'all';
  selectedItem: MediaItem | null = null;
  
  filteredMedia$: Observable<MediaItem[]>;

  constructor(private mediaService: MediaDatabaseService) {
    this.filteredMedia$ = combineLatest([
      this.mediaItems$,
      new BehaviorSubject(this.filterType) // TODO: Make reactive if needed
    ]).pipe(
      map(([items]) => {
        return items.filter(item => {
          return this.filterType === 'all' || item.type === this.filterType;
        });
      })
    );
  }

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.loading$.next(true);
    // Reutiliza o serviço existente que já busca do Firestore
    this.mediaService.getMedia().subscribe({
      next: (items) => {
        // Filtra apenas itens publicados (embora o serviço possa retornar tudo, 
        // idealmente teríamos um método getPublishedMedia no serviço)
        const publishedItems = items.filter(i => i.status === 'published');
        this.mediaItems$.next(publishedItems);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Erro ao carregar mídias:', err);
        this.loading$.next(false);
      }
    });
  }

  setFilter(type: string): void {
    this.filterType = type;
    // Força atualização do pipe
    this.mediaItems$.next(this.mediaItems$.value);
  }

  openLightbox(item: MediaItem): void {
    this.selectedItem = item;
    this.mediaService.incrementViews(item.id);
  }

  closeLightbox(): void {
    this.selectedItem = null;
  }
}
