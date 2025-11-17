import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaItem } from '../../shared/models';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="isOpen && mediaItem as item">
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        (click)="onClose()"
      >
        <div
          class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between bg-gray-900 text-white p-4">
            <h3 class="text-lg font-bold truncate">{{ item.title }}</h3>
            <button (click)="onClose()" class="text-2xl hover:text-gray-300">✕</button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-auto bg-black flex items-center justify-center">
            <!-- Imagem -->
            <ng-container *ngIf="item.type === 'photo'">
              <img
                [src]="item.mediaUrl"
                [alt]="item.title"
                class="max-w-full max-h-full object-contain"
              />
            </ng-container>

            <!-- Vídeo -->
            <ng-container *ngIf="item.type === 'video'">
              <video
                [src]="item.mediaUrl"
                class="max-w-full max-h-full object-contain"
                controls
                autoplay
              ></video>
            </ng-container>

            <!-- Documento -->
            <ng-container *ngIf="item.type === 'document'">
              <div class="flex flex-col items-center justify-center gap-4">
                <span class="text-6xl">📄</span>
                <p class="text-white text-lg">{{ item.title }}</p>
                <a
                  [href]="item.mediaUrl"
                  download
                  class="bg-primary-blue hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  📥 Baixar Arquivo
                </a>
              </div>
            </ng-container>
          </div>

          <!-- Footer Info -->
          <div class="bg-gray-100 p-4 border-t">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
              <div>
                <p class="text-xs text-gray-600">Carregado por</p>
                <p class="font-medium">{{ item.uploadedBy }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600">Data</p>
                <p class="font-medium">{{ item.createdAt | date : 'dd/MM/yyyy' }}</p>
              </div>
              <div *ngIf="item.duration">
                <p class="text-xs text-gray-600">Duração</p>
                <p class="font-medium">{{ formatDuration(item.duration) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600">Interações</p>
                <p class="font-medium">❤️ {{ item.likes || 0 }} 👁️ {{ item.views || 0 }}</p>
              </div>
            </div>
            <p *ngIf="item.description" class="mt-4 text-sm text-gray-700">
              {{ item.description }}
            </p>
          </div>

          <!-- Navigation -->
          <div *ngIf="currentIndex + 1 < totalItems" class="bg-white border-t px-4 py-3 flex gap-2">
            <button
              *ngIf="currentIndex > 0"
              (click)="onPrevious()"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg font-medium"
            >
              ← Anterior
            </button>
            <span class="flex-1 flex items-center justify-center text-gray-600 font-medium">
              {{ currentIndex + 1 }} / {{ totalItems }}
            </span>
            <button
              *ngIf="currentIndex + 1 < totalItems"
              (click)="onNext()"
              class="flex-1 bg-primary-blue hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class MediaViewerComponent {
  @Input() isOpen = false;
  @Input() mediaItem: MediaItem | null = null;
  @Input() currentIndex = 0;
  @Input() totalItems = 0;

  @Output() close = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  formatDuration(seconds: number | undefined): string {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
