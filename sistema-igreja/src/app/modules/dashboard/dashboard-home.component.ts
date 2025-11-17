import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PastorService } from '../../core/services/pastor.service';
import { MediaService } from '../../core/services/media.service';
import { PastorDailyMessage, Sermon, MediaItem } from '../../shared/models';
import { MediaViewerComponent } from '../../shared/components/media-viewer.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MediaViewerComponent],
  template: `
    <div class="space-y-8">
      <!-- Título da Página -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Dashboard Principal</h1>
        <p class="text-gray-600 mt-2">Resumo das atividades e informações da chiesa</p>
      </div>

      <!-- Media Viewer Modal -->
      <app-media-viewer
        [isOpen]="isViewerOpen"
        [mediaItem]="selectedMediaItem"
        [currentIndex]="selectedMediaIndex"
        [totalItems]="mediaGallery.length"
        (close)="onCloseViewer()"
        (next)="onNextMedia()"
        (previous)="onPreviousMedia()"
      ></app-media-viewer>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total de Membros -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total de Membros</p>
              <p class="text-4xl font-bold text-primary-blue mt-2">1.234</p>
              <p class="text-xs text-green-600 mt-2">↑ 12 novos este mês</p>
            </div>
            <div class="text-5xl opacity-20">👥</div>
          </div>
        </div>

        <!-- Dízimos (Mês) -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Dízimos (Mês)</p>
              <p class="text-4xl font-bold text-primary-blue mt-2">1.234</p>
              <p class="text-xs text-green-600 mt-2">↑ 8% vs mês anterior</p>
            </div>
            <div class="text-5xl opacity-20">💰</div>
          </div>
        </div>

        <!-- Ofertas -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Ofertas (Mês)</p>
              <p class="text-4xl font-bold text-primary-orange mt-2">R$ 2.150</p>
              <p class="text-xs text-green-600 mt-2">↑ 5% vs mês anterior</p>
            </div>
            <div class="text-5xl opacity-20">🎁</div>
          </div>
        </div>

        <!-- Eventos Próximos -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Eventos Próximos</p>
              <p class="text-4xl font-bold text-primary-red mt-2">5</p>
              <p class="text-xs text-blue-600 mt-2">Próximo: Batismo - 28/11</p>
            </div>
            <div class="text-5xl opacity-20">📅</div>
          </div>
        </div>
      </div>

      <!-- Seção de Conteúdo Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Palavra do Pastor -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📖</span>
              <h3 class="text-2xl font-bold text-gray-900">Palavra do Pastor</h3>
            </div>
            <a routerLink="/pastor" class="text-sm text-primary-blue hover:text-blue-700"
              >Ver todas →</a
            >
          </div>
          <div class="space-y-4" *ngIf="latestDailyMessage">
            <div class="bg-gradient-to-r from-primary-blue to-blue-600 text-white rounded-xl p-6">
              <h4 class="text-xl font-bold mb-2">{{ latestDailyMessage.title }}</h4>
              <p class="text-blue-100 mb-4">{{ latestDailyMessage.message }}</p>
              <div class="flex gap-2 flex-wrap">
                <span *ngIf="latestDailyMessage.biblicalText" class="badge badge-warning">{{
                  latestDailyMessage.biblicalText
                }}</span>
                <span *ngFor="let tag of latestDailyMessage.tags" class="badge badge-warning">{{
                  tag
                }}</span>
              </div>
              <p class="text-xs text-blue-200 mt-4">
                - {{ latestDailyMessage.pastor }} •
                {{ latestDailyMessage.date | date : 'dd/MM/yyyy' }}
              </p>
            </div>
          </div>
          <div *ngIf="!latestDailyMessage" class="text-center py-8 text-gray-500">
            <p>Nenhuma palavra do pastor publicada no momento</p>
          </div>
        </div>

        <!-- Aniversariantes do Mês -->
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">🎂</span>
            <h3 class="text-lg font-bold text-gray-900">Aniversariantes</h3>
          </div>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between p-3 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900">Maria Silva</p>
                <p class="text-sm text-gray-600">16/11/1990</p>
              </div>
              <span>🎈</span>
            </div>
            <div
              class="flex items-center justify-between p-3 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900">João Santos</p>
                <p class="text-sm text-gray-600">18/11/1985</p>
              </div>
              <span>🎈</span>
            </div>
            <div
              class="flex items-center justify-between p-3 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900">Ana Costa</p>
                <p class="text-sm text-gray-600">21/11/1988</p>
              </div>
              <span>🎈</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sermões Recentes do Pastor -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎤</span>
            <h3 class="text-2xl font-bold text-gray-900">Sermões Recentes</h3>
          </div>
          <a routerLink="/pastor" class="text-sm text-primary-blue hover:text-blue-700"
            >Ver todos →</a
          >
        </div>
        <div class="space-y-3" *ngIf="recentSermons && recentSermons.length > 0">
          <div
            *ngFor="let sermon of recentSermons"
            class="flex items-start justify-between p-4 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div class="flex-1">
              <p class="font-bold text-gray-900">{{ sermon.title }}</p>
              <p class="text-sm text-gray-600 mt-1">
                {{ sermon.biblicalText }} • {{ sermon.pastor }}
              </p>
              <div class="flex gap-2 mt-2 flex-wrap">
                <span class="badge text-xs">📅 {{ sermon.date | date : 'dd/MM/yyyy' }}</span>
                <span class="badge text-xs">⏱️ {{ sermon.duration }}min</span>
                <span class="badge text-xs">👥 {{ sermon.attendance }} pessoas</span>
              </div>
            </div>
          </div>
        </div>
        <div
          *ngIf="!recentSermons || recentSermons.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <p>Nenhum sermão registrado no momento</p>
        </div>
      </div>

      <!-- Mural/Carrossel de Imagens -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🖼️</span>
            <h3 class="text-2xl font-bold text-gray-900">Mural de Fotos e Vídeos</h3>
          </div>
          <span class="badge text-sm">{{ mediaGallery.length }} itens</span>
        </div>

        <!-- Upload Area -->
        <div class="mb-6">
          <div
            class="border-2 border-dashed border-primary-blue rounded-lg p-6 text-center hover:bg-blue-50 transition-colors"
          >
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept="image/*,video/*"
              multiple
              style="display: none"
            />
            <div (click)="fileInput.click()" class="cursor-pointer">
              <p class="text-4xl mb-2">📤</p>
              <p class="font-medium text-gray-900">Clique ou arraste arquivos</p>
              <p class="text-sm text-gray-600 mt-1">
                Suporte: Fotos (JPG, PNG), Vídeos (MP4, WebM)
              </p>
            </div>
          </div>
        </div>

        <!-- Gallery -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" *ngIf="mediaGallery.length > 0">
          <div
            *ngFor="let item of mediaGallery; let i = index"
            (click)="onOpenMediaViewer(item, i)"
            class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <!-- Imagem/Vídeo -->
            <div *ngIf="item.type === 'photo'" class="w-full h-full">
              <img [src]="item.mediaUrl" [alt]="item.title" class="w-full h-full object-cover" />
            </div>
            <div *ngIf="item.type === 'video'" class="w-full h-full relative bg-black">
              <video [src]="item.mediaUrl" class="w-full h-full object-cover"></video>
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors"
              >
                <span class="text-4xl">▶️</span>
              </div>
              <span
                *ngIf="item.duration"
                class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
              >
                {{ formatDuration(item.duration) }}
              </span>
            </div>

            <!-- Info Overlay -->
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100"
            >
              <p class="text-white font-medium text-sm truncate">{{ item.title }}</p>
              <div class="flex gap-2 text-white text-xs mt-1">
                <span *ngIf="item.views">👁️ {{ item.views }}</span>
                <span *ngIf="item.likes">❤️ {{ item.likes }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
            >
              <button
                (click)="onLikeMedia(item.id)"
                class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full text-sm"
                title="Curtir"
              >
                ❤️
              </button>
              <button
                (click)="onDeleteMedia(item.id)"
                class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-sm"
                title="Deletar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="mediaGallery.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-lg">Nenhuma mídia no mural ainda</p>
          <p class="text-sm">Clique na área de upload para adicionar fotos e vídeos</p>
        </div>
      </div>

      <!-- Eventos Próximos -->
      <div class="card">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">📅</span>
          <h3 class="text-2xl font-bold text-gray-900">Próximos Eventos</h3>
        </div>
        <div class="space-y-3">
          <div
            class="flex items-center justify-between p-4 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div>
              <p class="font-bold text-gray-900">Batismo de Novos Membros</p>
              <p class="text-sm text-gray-600">28 de Novembro • 14:00</p>
            </div>
            <span class="badge badge-primary">Confira</span>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div>
              <p class="font-bold text-gray-900">Reunião de Células</p>
              <p class="text-sm text-gray-600">30 de Novembro • 19:00</p>
            </div>
            <span class="badge badge-primary">Confira</span>
          </div>
          <div
            class="flex items-center justify-between p-4 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div>
              <p class="font-bold text-gray-900">Conferência Anual</p>
              <p class="text-sm text-gray-600">05 de Dezembro • 09:00</p>
            </div>
            <span class="badge badge-primary">Confira</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardHomeComponent implements OnInit {
  latestDailyMessage: PastorDailyMessage | undefined;
  recentSermons: Sermon[] = [];
  mediaGallery: MediaItem[] = [];
  isUploadingFile = false;

  // Media Viewer
  isViewerOpen = false;
  selectedMediaItem: MediaItem | null = null;
  selectedMediaIndex = 0;

  constructor(private pastorService: PastorService, private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Carrega a última mensagem do pastor
    this.pastorService.getLatestDailyMessage().subscribe((message) => {
      this.latestDailyMessage = message;
    });

    // Carrega os últimos 5 sermões
    this.pastorService.getRecentSermons(5).subscribe((sermons) => {
      this.recentSermons = sermons;
    });

    // Carrega mídias publicadas
    this.mediaService.getPublishedMedia().subscribe((items) => {
      this.mediaGallery = items.slice(0, 8); // Limita a 8 itens no mural
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) return;

    this.isUploadingFile = true;

    for (const file of Array.from(files)) {
      try {
        const type = this.getFileType(file.type);
        if (!type) {
          alert(`Tipo de arquivo não suportado: ${file.name}`);
          continue;
        }

        const mediaUrl = await this.mediaService.convertFileToBase64(file);
        let thumbnailUrl: string | undefined;
        let duration: number | undefined;

        // Gera miniatura e duração para vídeos
        if (type === 'video') {
          thumbnailUrl = await this.mediaService.generateThumbnail(file, type);
          duration = await this.mediaService.getVideoDuration(file);
        } else if (type === 'photo') {
          thumbnailUrl = await this.mediaService.generateThumbnail(file, type);
        }

        // Cria o item de mídia
        const mediaItem: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
          churchId: 'church-1',
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
          description: '',
          type,
          mediaUrl,
          thumbnailUrl,
          fileSize: file.size,
          duration,
          uploadedBy: 'Membro',
          status: 'published',
          tags: [type],
        };

        this.mediaService.uploadMedia(mediaItem);
        this.loadDashboardData();
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        alert(`Erro ao fazer upload de ${file.name}`);
      }
    }

    this.isUploadingFile = false;
    input.value = ''; // Limpa o input
  }

  private getFileType(mimeType: string): 'photo' | 'video' | 'document' | null {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (
      mimeType === 'application/pdf' ||
      mimeType === 'application/msword' ||
      mimeType.includes('spreadsheetml') ||
      mimeType.includes('presentationml')
    )
      return 'document';
    return null;
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  onLikeMedia(id: string): void {
    this.mediaService.likeMedia(id);
    this.loadDashboardData();
  }

  onDeleteMedia(id: string): void {
    if (confirm('Tem certeza que deseja deletar essa mídia?')) {
      this.mediaService.deleteMedia(id);
      this.loadDashboardData();
    }
  }

  // Media Viewer Methods
  onOpenMediaViewer(mediaItem: MediaItem, index: number): void {
    this.selectedMediaItem = mediaItem;
    this.selectedMediaIndex = index;
    this.isViewerOpen = true;
    this.mediaService.incrementViews(mediaItem.id);
  }

  onCloseViewer(): void {
    this.isViewerOpen = false;
    this.selectedMediaItem = null;
  }

  onNextMedia(): void {
    if (this.selectedMediaIndex + 1 < this.mediaGallery.length) {
      this.selectedMediaIndex++;
      this.selectedMediaItem = this.mediaGallery[this.selectedMediaIndex];
      this.mediaService.incrementViews(this.selectedMediaItem.id);
    }
  }

  onPreviousMedia(): void {
    if (this.selectedMediaIndex > 0) {
      this.selectedMediaIndex--;
      this.selectedMediaItem = this.mediaGallery[this.selectedMediaIndex];
      this.mediaService.incrementViews(this.selectedMediaItem.id);
    }
  }
}
