import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MediaDatabaseService } from '../../../core/services/media-database.service';
import { MediaItem } from '../../../shared/models/media.model';

@Component({
  selector: 'app-media-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto" *ngIf="media">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-center">
        <button routerLink="../" class="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Voltar para Galeria
        </button>
        <div class="flex gap-2">
          <button
            (click)="deleteMedia()"
            class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Excluir Mídia
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Media Preview (Left Column) -->
        <div class="lg:col-span-2 bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
          <img
            *ngIf="media.type === 'photo'"
            [src]="media.mediaUrl"
            [alt]="media.title"
            class="max-w-full max-h-[600px] object-contain"
          />
          <video
            *ngIf="media.type === 'video'"
            [src]="media.mediaUrl"
            controls
            class="max-w-full max-h-[600px]"
          ></video>
        </div>

        <!-- Details & Edit Form (Right Column) -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Detalhes da Mídia</h2>

          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                [(ngModel)]="media.title"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                [(ngModel)]="media.description"
                rows="4"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- Stats -->
            <div class="py-4 border-t border-b border-gray-100 grid grid-cols-2 gap-4">
              <div class="text-center">
                <span class="block text-2xl font-bold text-gray-900">{{ media.views || 0 }}</span>
                <span class="text-xs text-gray-500">Visualizações</span>
              </div>
              <div class="text-center">
                <span class="block text-2xl font-bold text-gray-900">{{ media.likes || 0 }}</span>
                <span class="text-xs text-gray-500">Curtidas</span>
              </div>
            </div>

            <!-- Info -->
            <div class="text-sm text-gray-500 space-y-2">
              <p><strong>Tipo:</strong> {{ media.type === 'photo' ? 'Foto' : 'Vídeo' }}</p>
              <p><strong>Tamanho:</strong> {{ formatBytes(media.fileSize || 0) }}</p>
              <p><strong>Data:</strong> {{ media.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>

            <!-- Save Button -->
            <button
              (click)="saveChanges()"
              [disabled]="isSaving"
              class="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!media" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
    </div>
  `,
  styles: []
})
export class MediaDetailComponent implements OnInit {
  media: MediaItem | null = null;
  isSaving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mediaService: MediaDatabaseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMedia(id);
    }
  }

  loadMedia(id: string): void {
    this.mediaService.getMediaById(id).subscribe(item => {
      if (item) {
        this.media = item;
        // Incrementar visualizações
        this.mediaService.incrementViews(id);
      } else {
        alert('Mídia não encontrada');
        this.router.navigate(['/dashboard/media']);
      }
    });
  }

  async saveChanges(): Promise<void> {
    if (!this.media) return;

    this.isSaving = true;
    try {
      await this.mediaService.updateMedia(this.media.id, {
        title: this.media.title,
        description: this.media.description
      });
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteMedia(): Promise<void> {
    if (!this.media) return;

    if (confirm('Tem certeza que deseja excluir permanentemente esta mídia?')) {
      try {
        await this.mediaService.deleteMedia(this.media.id);
        this.router.navigate(['/dashboard/media']);
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir mídia.');
      }
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
