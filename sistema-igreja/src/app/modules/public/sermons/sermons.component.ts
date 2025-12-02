import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PastorDatabaseService } from '../../../core/services/pastor-database.service';
import { Sermon } from '../../../shared/models/pastor.model';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-public-sermons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Mensagens e Pregações</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Seja edificado pela Palavra de Deus. Assista ou ouça nossas mensagens recentes.
          </p>
        </div>

        <!-- Sermons Grid -->
        <div *ngIf="sermons$ | async as sermons; else loading">
          <div *ngIf="sermons.length > 0; else empty" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div *ngFor="let sermon of sermons" class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 flex flex-col h-full">
              <!-- Video/Media Placeholder -->
              <div class="aspect-video bg-gray-900 relative group cursor-pointer" (click)="openSermon(sermon)">
                <!-- If it's a YouTube URL, we could show a thumbnail, but for now let's show a generic placeholder or the video if embedded -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-4xl text-white opacity-80 group-hover:scale-110 transition-transform">▶️</span>
                </div>
                <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {{ sermon.date | date:'dd/MM/yyyy' }}
                </div>
              </div>

              <!-- Content -->
              <div class="p-6 flex-1 flex flex-col">
                <div class="mb-4">
                  <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2" [title]="sermon.title">
                    {{ sermon.title }}
                  </h3>
                  <p class="text-primary-blue font-medium text-sm flex items-center gap-1">
                    🎤 {{ sermon.preacher }}
                  </p>
                </div>

                <div class="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                  <p *ngIf="sermon.series" class="flex items-center gap-2">
                    <span class="font-medium text-gray-700">Série:</span> {{ sermon.series }}
                  </p>
                  <p *ngIf="sermon.scriptureReference" class="flex items-center gap-2">
                    <span class="font-medium text-gray-700">Texto:</span> {{ sermon.scriptureReference }}
                  </p>
                  <p *ngIf="sermon.notes" class="line-clamp-3 mt-2 italic">
                    "{{ sermon.notes }}"
                  </p>
                </div>

                <button 
                  (click)="openSermon(sermon)"
                  class="w-full py-2 border border-primary-blue text-primary-blue rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Assistir Mensagem
                </button>
              </div>
            </div>

          </div>

          <ng-template #empty>
            <div class="text-center py-20 bg-white rounded-2xl shadow-sm">
              <p class="text-6xl mb-4">📖</p>
              <h3 class="text-xl font-medium text-gray-900">Nenhuma mensagem disponível</h3>
              <p class="text-gray-500 mt-2">Em breve teremos novas pregações por aqui.</p>
            </div>
          </ng-template>
        </div>

        <ng-template #loading>
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        </ng-template>
      </div>

      <!-- Video Modal -->
      <div *ngIf="selectedSermon" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" (click)="closeSermon()">
        <div class="max-w-4xl w-full bg-black rounded-lg overflow-hidden shadow-2xl relative" (click)="$event.stopPropagation()">
          <button 
            class="absolute -top-10 right-0 text-white hover:text-gray-300"
            (click)="closeSermon()"
          >
            Fechar ✕
          </button>
          
          <div class="aspect-video bg-black flex items-center justify-center">
            <iframe 
              *ngIf="getSafeUrl(selectedSermon.mediaUrl)"
              [src]="getSafeUrl(selectedSermon.mediaUrl)" 
              class="w-full h-full" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
            <div *ngIf="!selectedSermon.mediaUrl" class="text-white text-center p-8">
              <p class="text-xl">Áudio/Vídeo não disponível para esta mensagem.</p>
            </div>
          </div>
          
          <div class="bg-white p-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ selectedSermon.title }}</h2>
            <p class="text-gray-600 mt-1">{{ selectedSermon.preacher }} • {{ selectedSermon.date | date:'longDate' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PublicSermonsComponent implements OnInit {
  sermons$: Observable<Sermon[]>;
  selectedSermon: Sermon | null = null;

  constructor(
    private pastorService: PastorDatabaseService,
    private sanitizer: DomSanitizer
  ) {
    this.sermons$ = this.pastorService.getSermons();
  }

  ngOnInit(): void {}

  openSermon(sermon: Sermon): void {
    this.selectedSermon = sermon;
  }

  closeSermon(): void {
    this.selectedSermon = null;
  }

  getSafeUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    
    // Simple YouTube embed converter
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
