import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../../../core/services/media.service';
import {
  MediaPaginationService,
  PaginationState,
} from '../../../../core/services/media-pagination.service';
import { MediaViewerComponent } from '../../../../shared/components/media-viewer.component';
import { MediaItem } from '../../../../shared/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Componente de Galeria com Lazy Loading e Paginação
 * Exibe 6 itens por página (2-3 por linha)
 * Otimizado para produção com infinite scroll
 */
@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule, MediaViewerComponent],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <!-- Cabeçalho da Galeria -->
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Galeria de Mídia</h2>
        <p class="text-gray-600">
          Mostrando <span class="font-semibold">{{ getStartItem() }}-{{ getEndItem() }}</span> de
          <span class="font-semibold">{{ paginationState?.totalItems }}</span> itens
        </p>
      </div>

      <!-- Grade de Mídias -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        *ngIf="paginationState && paginationState.visibleItems.length > 0; else noMedia"
      >
        <div
          *ngFor="let item of paginationState!.visibleItems; let i = index"
          class="group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          (click)="onOpenMediaViewer(item, i)"
        >
          <!-- Thumbnail -->
          <div class="relative h-48 bg-gray-200 overflow-hidden">
            <img
              *ngIf="item.type === 'photo'"
              [src]="item.thumbnailUrl || item.mediaUrl"
              [alt]="item.title"
              class="w-full h-full object-cover group-hover:brightness-75 transition-all"
            />
            <video
              *ngIf="item.type === 'video'"
              [poster]="item.thumbnailUrl"
              class="w-full h-full object-cover group-hover:brightness-75 transition-all"
            ></video>
            <div
              *ngIf="item.type === 'document'"
              class="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center"
            >
              <svg class="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M8 16.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM15 12.866A5 5 0 1 0 5 12.866M1 13a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v5H1v-5z"
                />
              </svg>
            </div>

            <!-- Badge de Tipo -->
            <div
              class="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs"
            >
              {{ getBadgeLabel(item.type) }}
            </div>

            <!-- Contador de Views/Likes -->
            <div
              class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex gap-3"
            >
              <span>👁 {{ item.views || 0 }}</span>
              <span>❤ {{ item.likes || 0 }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4 bg-white">
            <h3 class="font-semibold text-gray-800 truncate">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 truncate">{{ item.description }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Estado Vazio -->
      <ng-template #noMedia>
        <div class="text-center py-12">
          <svg
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p class="text-gray-500 text-lg">Nenhuma mídia disponível</p>
        </div>
      </ng-template>

      <!-- Controles de Paginação -->
      <div class="flex items-center justify-between">
        <!-- Botão Anterior -->
        <button
          (click)="previousPage()"
          [disabled]="!paginationState?.hasPreviousPage"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>

        <!-- Informação de Página -->
        <div class="text-center">
          <p class="text-gray-700 font-semibold">
            Página <span class="text-blue-600">{{ paginationState?.currentPage }}</span> de
            <span class="text-blue-600">{{ paginationState?.totalPages }}</span>
          </p>
        </div>

        <!-- Botão Próxima -->
        <button
          (click)="nextPage()"
          [disabled]="!paginationState?.hasNextPage"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Próxima →
        </button>
      </div>

      <!-- Visualizador de Mídia Modal -->
      <app-media-viewer
        [isOpen]="isViewerOpen"
        [mediaItem]="selectedMediaItem"
        [currentIndex]="selectedMediaIndex"
        [totalItems]="paginationState?.totalItems || 0"
        (close)="onCloseViewer()"
        (next)="onNextMedia()"
        (previous)="onPreviousMedia()"
      ></app-media-viewer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        padding: 2rem 0;
      }
    `,
  ],
})
export class MediaGalleryComponent implements OnInit, OnDestroy {
  paginationState: PaginationState | null = null;
  isViewerOpen = false;
  selectedMediaItem: MediaItem | null = null;
  selectedMediaIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private mediaService: MediaService,
    private paginationService: MediaPaginationService
  ) {}

  ngOnInit(): void {
    this.loadMediaItems();

    // Subscreve a mudanças de paginação
    this.paginationService.paginationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: PaginationState) => {
        this.paginationState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega mídias publicadas
   */
  private loadMediaItems(): void {
    this.mediaService
      .getPublishedMedia()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: MediaItem[]) => {
        this.paginationService.setItems(items);
      });
  }

  /**
   * Avança para próxima página
   */
  nextPage(): void {
    this.paginationService.nextPage();
  }

  /**
   * Volta para página anterior
   */
  previousPage(): void {
    this.paginationService.previousPage();
  }

  /**
   * Abre visualizador de mídia
   */
  onOpenMediaViewer(item: MediaItem, index: number): void {
    this.selectedMediaItem = item;
    this.selectedMediaIndex = index;
    this.isViewerOpen = true;

    // Incrementa contador de views
    this.mediaService.incrementViews(item.id);
  }

  /**
   * Fecha visualizador
   */
  onCloseViewer(): void {
    this.isViewerOpen = false;
    this.selectedMediaItem = null;
  }

  /**
   * Navega para próxima mídia
   */
  onNextMedia(): void {
    if (this.paginationState) {
      const nextIndex = this.selectedMediaIndex + 1;
      if (nextIndex < this.paginationState.visibleItems.length) {
        const nextItem = this.paginationState.visibleItems[nextIndex];
        this.selectedMediaItem = nextItem;
        this.selectedMediaIndex = nextIndex;
        this.mediaService.incrementViews(nextItem.id);
      } else if (this.paginationState.hasNextPage) {
        // Carrega próxima página automaticamente
        this.paginationService.nextPage();
      }
    }
  }

  /**
   * Navega para mídia anterior
   */
  onPreviousMedia(): void {
    if (this.selectedMediaIndex > 0) {
      const prevIndex = this.selectedMediaIndex - 1;
      const prevItem = this.paginationState?.visibleItems[prevIndex];
      if (prevItem) {
        this.selectedMediaItem = prevItem;
        this.selectedMediaIndex = prevIndex;
        this.mediaService.incrementViews(prevItem.id);
      }
    } else if (this.paginationState?.hasPreviousPage) {
      // Carrega página anterior automaticamente
      this.paginationService.previousPage();
    }
  }

  /**
   * Formata data para exibição
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Obtém rótulo de tipo de mídia
   */
  getBadgeLabel(type: string): string {
    const labels: Record<string, string> = {
      photo: '🖼️ Foto',
      video: '🎥 Vídeo',
      document: '📄 Doc',
    };
    return labels[type] || type;
  }

  /**
   * Obtém índice do primeiro item da página
   */
  getStartItem(): number {
    if (!this.paginationState) return 0;
    return (this.paginationState.currentPage - 1) * this.paginationState.pageSize + 1;
  }

  /**
   * Obtém índice do último item da página
   */
  getEndItem(): number {
    if (!this.paginationState) return 0;
    return Math.min(
      this.paginationState.currentPage * this.paginationState.pageSize,
      this.paginationState.totalItems
    );
  }
}
