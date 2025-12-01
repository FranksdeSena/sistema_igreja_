import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PastorDatabaseService } from '../../core/services/pastor-database.service';
import { MediaService } from '../../core/services/media.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { FinanceDatabaseService } from '../../core/services/finance-database.service';
import { EventsDatabaseService } from '../../core/services/events-database.service';
import { Sermon, MediaItem, Member, Event as EventModel } from '../../shared/models';
import { MediaViewerComponent } from '../../shared/components/media-viewer.component';
import { PastorWordWidgetComponent } from './components/pastor-word-widget/pastor-word-widget.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MediaViewerComponent, PastorWordWidgetComponent],
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
              <p class="text-4xl font-bold text-primary-blue mt-2">{{ totalMembers$ | async }}</p>
              <p class="text-xs text-gray-500 mt-2">Sincronizado em tempo real</p>
            </div>
            <div class="text-5xl opacity-20">👥</div>
          </div>
        </div>

        <!-- Dízimos (Mês) -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Dízimos (Mês)</p>
              <p class="text-4xl font-bold text-green-600 mt-2">R$ {{ totalIncome$ | async | number:'1.2-2' }}</p>
              <p class="text-xs text-gray-500 mt-2">Total de receitas</p>
            </div>
            <div class="text-5xl opacity-20">💰</div>
          </div>
        </div>

        <!-- Ofertas -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Ofertas (Mês)</p>
              <p class="text-4xl font-bold text-red-600 mt-2">R$ {{ totalExpense$ | async | number:'1.2-2' }}</p>
              <p class="text-xs text-gray-500 mt-2">Total de despesas</p>
            </div>
            <div class="text-5xl opacity-20">🎁</div>
          </div>
        </div>

        <!-- Eventos Próximos -->
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Eventos Próximos</p>
              <p class="text-4xl font-bold text-primary-red mt-2">{{ upcomingEvents$ | async }}</p>
              <p class="text-xs text-gray-500 mt-2">Sincronizado em tempo real</p>
            </div>
            <div class="text-5xl opacity-20">📅</div>
          </div>
        </div>
      </div>

      <!-- Seção de Conteúdo Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Palavra do Pastor -->
        <div class="lg:col-span-2">
          <app-pastor-word-widget></app-pastor-word-widget>
        </div>

        <!-- Aniversariantes do Mês -->
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">🎂</span>
            <h3 class="text-lg font-bold text-gray-900">Aniversariantes</h3>
          </div>
          <div class="space-y-3">
            <div
              *ngFor="let member of birthdays$ | async"
              class="flex items-center justify-between p-3 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-900">{{ member.name }}</p>
                <p class="text-sm text-gray-600">{{ member.birthDate | date:'dd/MM/yyyy':'UTC' }}</p>
              </div>
              <span>🎈</span>
            </div>
            <div
              *ngIf="(birthdays$ | async)?.length === 0"
              class="text-center py-8 text-gray-500"
            >
              <p>Nenhum aniversariante este mês</p>
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
          <a routerLink="/dashboard/pastor" class="text-sm text-primary-blue hover:text-blue-700"
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
                {{ sermon.scriptureReference }} • {{ sermon.preacher }}
              </p>
              <div class="flex gap-2 mt-2 flex-wrap">
                <span class="badge text-xs">📅 {{ sermon.date | date : 'dd/MM/yyyy' }}</span>
                <span class="badge text-xs" *ngIf="sermon.series">📚 {{ sermon.series }}</span>
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
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📅</span>
            <h3 class="text-2xl font-bold text-gray-900">Próximos Eventos</h3>
          </div>
          <a routerLink="/dashboard/eventos" class="text-sm text-primary-blue hover:text-blue-700">
            Ver todos →
          </a>
        </div>
        <div class="space-y-3" *ngIf="upcomingEventsList$ | async as events">
          <div
            *ngFor="let event of events"
            class="flex items-center justify-between p-4 bg-background-gray rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            [routerLink]="['/dashboard/eventos']"
          >
            <div class="flex-1">
              <p class="font-bold text-gray-900">{{ event.name }}</p>
              <p class="text-sm text-gray-600">
                {{ event.date | date:'dd/MM/yyyy' }} • {{ event.time }}
              </p>
              <p class="text-xs text-gray-500 mt-1" *ngIf="event.location">
                📍 {{ event.location }}
              </p>
            </div>
            <span 
              class="badge text-xs"
              [ngClass]="{
                'badge-primary': event.status === 'scheduled',
                'bg-green-100 text-green-800': event.status === 'completed',
                'bg-red-100 text-red-800': event.status === 'cancelled'
              }"
            >
              {{ event.status === 'scheduled' ? 'Agendado' : event.status === 'completed' ? 'Realizado' : 'Cancelado' }}
            </span>
          </div>
          <div *ngIf="events.length === 0" class="text-center py-8 text-gray-500">
            <p>Nenhum evento próximo agendado</p>
            <a routerLink="/dashboard/eventos/novo" class="text-sm text-primary-blue hover:text-blue-700 mt-2 inline-block">
              Criar novo evento →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardHomeComponent implements OnInit {
  recentSermons: Sermon[] = [];
  mediaGallery: MediaItem[] = [];
  isUploadingFile = false;

  // Media Viewer
  isViewerOpen = false;
  selectedMediaItem: MediaItem | null = null;
  selectedMediaIndex = 0;

  // Observables em tempo real
  totalMembers$: Observable<number>;
  totalIncome$: Observable<number>;
  totalExpense$: Observable<number>;
  upcomingEvents$: Observable<number>;
  upcomingEventsList$: Observable<EventModel[]>;
  birthdays$: Observable<Member[]>;

  constructor(
    private pastorService: PastorDatabaseService,
    private mediaService: MediaService,
    private membersService: MembersDatabaseService,
    private financeService: FinanceDatabaseService,
    private eventsService: EventsDatabaseService
  ) {
    // Inicializar observables
    this.totalMembers$ = this.membersService.getTotalMembersCount();
    this.totalIncome$ = this.financeService.getTotalIncome();
    this.totalExpense$ = this.financeService.getTotalExpense();
    this.upcomingEvents$ = this.eventsService.getUpcomingEventsCount();
    this.birthdays$ = this.membersService.getBirthdaysThisMonth();
    
    // Buscar próximos 3 eventos
    this.upcomingEventsList$ = this.eventsService.getEvents().pipe(
      map((events: EventModel[]) => {
        const now = new Date();
        return events
          .filter((event: EventModel) => event.status === 'scheduled' && new Date(event.date) >= now)
          .sort((a: EventModel, b: EventModel) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      })
    );
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Carrega os últimos 5 sermões
    this.pastorService.getRecentSermons(5).subscribe((sermons) => {
      this.recentSermons = sermons;
    });

    // Carrega mídias publicadas (últimas 8)
    this.mediaService.getPublishedMedia().subscribe((items) => {
      this.mediaGallery = items.slice(0, 8);
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

        // Usar novo método de upload com Firebase Storage
        await this.mediaService.uploadMediaWithFile(file, {
          churchId: 'church-1',
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
          description: '',
          type,
          uploadedBy: 'Membro',
          status: 'published',
          tags: [type],
        });

        console.log(`Upload concluído: ${file.name}`);
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
