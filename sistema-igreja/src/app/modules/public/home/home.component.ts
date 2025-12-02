import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MembersDatabaseService } from '../../../core/services/members-database.service';
import { EventsDatabaseService } from '../../../core/services/events-database.service';
import { MediaDatabaseService } from '../../../core/services/media-database.service';
import { PastorDatabaseService } from '../../../core/services/pastor-database.service';
import { TestimoniesDatabaseService } from '../../../core/services/testimonies-database.service';
import { Event as EventModel } from '../../../shared/models/event.model';
import { MediaItem } from '../../../shared/models/media.model';
import { PastorWord, Sermon } from '../../../shared/models/pastor.model';
import { Testimony } from '../../../shared/models/testimony.model';
import { Observable, interval, Subscription, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface ChurchStats {
  totalMembers: number;
  eventsThisYear: number;
  totalSermons: number;
  socialActions: number;
}

interface Birthday {
  firstName: string;
  date: Date;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gray-900 text-white h-[600px] flex items-center overflow-hidden">
      <!-- Background Image Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10"></div>
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center"></div>

      <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-2xl">
          <span class="inline-block px-4 py-1 rounded-full bg-primary-blue/20 text-blue-200 text-sm font-medium mb-4 border border-blue-500/30 animate-fade-in">
            Bem-vindo à Igreja Batista Nacional Peniel - IBN
          </span>
          <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white animate-slide-up">
            Um lugar de <span class="text-blue-400">Fé</span> e <span class="text-orange-400">Esperança</span>
          </h1>
          <p class="text-xl text-gray-100 mb-8 leading-relaxed animate-slide-up" style="animation-delay: 0.2s">
            Somos uma comunidade apaixonada por Deus e pelas pessoas. Junte-se a nós nesta jornada de transformação e propósito.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 animate-slide-up" style="animation-delay: 0.4s">
            <a routerLink="/agenda" class="px-8 py-4 bg-primary-blue hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 text-center">
              Nossos Horários
            </a>
            <a routerLink="/sobre" class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full font-bold text-lg transition-all border border-white/30 text-center">
              Conheça Mais
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Próximos Eventos -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Próximos Encontros</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Confira nossa agenda e participe dos nossos eventos!
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
        </div>

        <!-- Events Grid -->
        <div *ngIf="!loading && (upcomingEvents$ | async) as events" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let event of events; let i = index" 
               class="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 text-center group">
            <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform"
                 [ngClass]="{
                   'bg-blue-100 text-primary-blue': i % 3 === 0,
                   'bg-orange-100 text-primary-orange': i % 3 === 1,
                   'bg-purple-100 text-purple-600': i % 3 === 2
                 }">
              {{ getEventIcon(event.category) }}
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ event.name }}</h3>
            <p class="font-semibold mb-4"
               [ngClass]="{
                 'text-primary-blue': i % 3 === 0,
                 'text-primary-orange': i % 3 === 1,
                 'text-purple-600': i % 3 === 2
               }">
              {{ getDayOfWeek(event.date) }} às {{ event.time }}
            </p>
            <p class="text-gray-500 text-sm" *ngIf="event.description">
              {{ event.description }}
            </p>
            <p class="text-gray-400 text-xs mt-2" *ngIf="event.location">
              📍 {{ event.location }}
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && (upcomingEvents$ | async)?.length === 0" class="text-center py-12">
          <p class="text-4xl mb-4">📅</p>
          <p class="text-gray-500">Nenhum evento programado no momento.</p>
          <p class="text-sm text-gray-400 mt-2">Volte em breve para conferir nossa agenda!</p>
        </div>

        <!-- Ver Todos -->
        <div class="text-center mt-12" *ngIf="!loading && (upcomingEvents$ | async)?.length">
          <a routerLink="/agenda" class="inline-flex items-center px-6 py-3 border border-primary-blue text-primary-blue rounded-full hover:bg-blue-50 transition-colors font-medium">
            Ver Agenda Completa →
          </a>
        </div>
      </div>
    </section>

    <!-- Palavra do Pastor -->
    <section class="py-20 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-12">
          <span class="inline-block px-4 py-1 rounded-full bg-blue-100 text-primary-blue text-sm font-medium mb-4">
            Palavra do Pastor
          </span>
          <h2 class="text-3xl font-bold text-gray-900">Versículo da Semana</h2>
        </div>

        <div *ngIf="(latestWord$ | async) as word" class="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-blue-100">
          <div class="text-6xl mb-6">📖</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ word.title }}</h3>
          <blockquote class="text-xl md:text-2xl font-serif text-gray-700 italic mb-6 leading-relaxed">
            "{{ word.content }}"
          </blockquote>
          <div class="mt-8 pt-8 border-t border-gray-100">
            <p class="text-sm text-gray-500">Por {{ word.authorName }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ word.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>

        <div *ngIf="!(latestWord$ | async)" class="bg-white rounded-3xl shadow-xl p-12 text-center">
          <p class="text-gray-400">Em breve teremos uma nova palavra para você!</p>
        </div>
      </div>
    </section>

    <!-- Últimas Mensagens/Sermões -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
            Palavra de Deus
          </span>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Últimas Mensagens</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Assista às pregações mais recentes e seja edificado pela Palavra
          </p>
        </div>

        <div *ngIf="(latestSermons$ | async) as sermons" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let sermon of sermons" 
               class="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 group cursor-pointer"
               (click)="openSermonModal(sermon)">
            <!-- Thumbnail -->
            <div class="aspect-video bg-gray-900 relative overflow-hidden">
              <img *ngIf="getYoutubeThumbnail(sermon.mediaUrl)" 
                   [src]="getYoutubeThumbnail(sermon.mediaUrl)" 
                   [alt]="sermon.title"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
              <div *ngIf="!getYoutubeThumbnail(sermon.mediaUrl)" 
                   class="w-full h-full flex items-center justify-center text-white text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                🎤
              </div>
              <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span class="text-purple-600 text-2xl ml-1">▶</span>
                </div>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-4">
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {{ sermon.title }}
              </h3>
              <p class="text-sm text-gray-500 mb-1">{{ sermon.preacher || sermon.pastor }}</p>
              <p class="text-xs text-gray-400">{{ sermon.date | date:'dd/MM/yyyy' }}</p>
              <p *ngIf="sermon.scriptureReference || sermon.biblicalText" 
                 class="text-xs text-purple-600 mt-2 font-medium">
                📖 {{ sermon.scriptureReference || sermon.biblicalText }}
              </p>
            </div>
          </div>
        </div>

        <div *ngIf="!(latestSermons$ | async)?.length" class="text-center py-12">
          <p class="text-4xl mb-4">🎤</p>
          <p class="text-gray-500">Novas mensagens em breve!</p>
        </div>

        <div class="text-center mt-12" *ngIf="(latestSermons$ | async)?.length">
          <a routerLink="/mensagens" class="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-medium shadow-lg">
            Ver Todas as Mensagens →
          </a>
        </div>
      </div>
    </section>

    <!-- Estatísticas da Igreja -->
    <section class="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold mb-4">Números que Inspiram</h2>
          <p class="text-blue-100 max-w-2xl mx-auto">
            Juntos estamos fazendo a diferença em nossa comunidade
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl md:text-6xl font-bold mb-2">{{ (stats$ | async)?.totalMembers || 0 }}</div>
            <p class="text-blue-100 text-sm md:text-base">Membros Ativos</p>
          </div>
          <div class="text-center">
            <div class="text-5xl md:text-6xl font-bold mb-2">{{ (stats$ | async)?.eventsThisYear || 0 }}</div>
            <p class="text-blue-100 text-sm md:text-base">Eventos em {{ currentYear }}</p>
          </div>
          <div class="text-center">
            <div class="text-5xl md:text-6xl font-bold mb-2">{{ (stats$ | async)?.totalSermons || 0 }}</div>
            <p class="text-blue-100 text-sm md:text-base">Mensagens Pregadas</p>
          </div>
          <div class="text-center">
            <div class="text-5xl md:text-6xl font-bold mb-2">{{ (stats$ | async)?.socialActions || 0 }}</div>
            <p class="text-blue-100 text-sm md:text-base">Ações Solidárias</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Carrossel de Fotos -->
    <section class="py-20 bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Momentos Especiais</h2>
          <p class="text-gray-400">Confira os melhores momentos da nossa comunidade</p>
        </div>

        <div *ngIf="(galleryPhotos$ | async) as photos" class="relative">
          <div class="overflow-hidden rounded-2xl">
            <div class="flex transition-transform duration-500 ease-out" 
                 [style.transform]="'translateX(-' + (currentPhotoIndex * 100) + '%)'">
              <div *ngFor="let photo of photos" class="min-w-full">
                <div class="aspect-video bg-gray-800 relative group">
                  <img [src]="photo.mediaUrl" [alt]="photo.title" 
                       class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div class="absolute bottom-0 left-0 right-0 p-8">
                      <h3 class="text-2xl font-bold mb-2">{{ photo.title }}</h3>
                      <p class="text-gray-300" *ngIf="photo.description">{{ photo.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Dots -->
          <div class="flex justify-center gap-2 mt-6" *ngIf="photos.length > 1">
            <button *ngFor="let photo of photos; let i = index"
                    (click)="goToPhoto(i)"
                    class="w-3 h-3 rounded-full transition-all"
                    [class.bg-white]="i === currentPhotoIndex"
                    [class.bg-white/30]="i !== currentPhotoIndex"
                    [class.w-8]="i === currentPhotoIndex">
            </button>
          </div>

          <div class="text-center mt-8">
            <a routerLink="/galeria" class="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/30 transition-colors font-medium">
              Ver Galeria Completa →
            </a>
          </div>
        </div>

        <div *ngIf="!(galleryPhotos$ | async)?.length" class="text-center py-12 text-gray-400">
          <p class="text-4xl mb-4">📷</p>
          <p>Em breve teremos fotos dos nossos eventos!</p>
        </div>
      </div>
    </section>

    <!-- Ações Solidárias -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1 rounded-full bg-orange-100 text-primary-orange text-sm font-medium mb-4">
            Faça a Diferença
          </span>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Ações Solidárias</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Juntos somos mais fortes! Participe das nossas ações sociais e missões.
          </p>
        </div>

        <div *ngIf="(socialActions$ | async) as actions" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let action of actions" 
               class="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl overflow-hidden border border-orange-100 hover:shadow-xl transition-all hover:-translate-y-2 group">
            <div class="h-48 bg-gradient-to-br from-primary-orange to-red-500 relative overflow-hidden">
              <div class="absolute inset-0 flex items-center justify-center text-white text-6xl group-hover:scale-110 transition-transform">
                {{ getSocialIcon(action.category) }}
              </div>
            </div>
            <div class="p-6">
              <span class="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mb-3">
                {{ action.category }}
              </span>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ action.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ action.description }}</p>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">📅 {{ action.date | date:'dd/MM' }}</span>
                <span class="text-primary-orange font-semibold">{{ action.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!(socialActions$ | async)?.length" class="text-center py-12">
          <p class="text-4xl mb-4">🤝</p>
          <p class="text-gray-500">Novas ações solidárias em breve!</p>
        </div>
      </div>
    </section>

    <!-- Aniversariantes da Semana -->
    <section class="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-4">
            Celebrando Vidas
          </span>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">🎂 Aniversariantes do Mês</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Parabéns aos irmãos que estão de aniversário este mês!
          </p>
        </div>

        <div *ngIf="(birthdays$ | async) as birthdays" class="max-w-4xl mx-auto">
          <div *ngIf="birthdays.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div *ngFor="let birthday of birthdays" 
                 class="bg-white rounded-xl p-4 text-center border border-orange-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎉
              </div>
              <h3 class="font-bold text-gray-900 mb-1">{{ birthday.firstName }}</h3>
              <p class="text-sm text-orange-600">{{ birthday.date | date:'dd/MM' }}</p>
            </div>
          </div>

          <div *ngIf="birthdays.length === 0" class="text-center py-12 bg-white rounded-xl border border-orange-100">
            <p class="text-4xl mb-4">🎂</p>
            <p class="text-gray-500">Nenhum aniversariante este mês</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testemunhos -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block px-4 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
            Vidas Transformadas
          </span>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Testemunhos</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Histórias reais de como Deus tem transformado vidas em nossa comunidade
          </p>
        </div>

        <div *ngIf="(testimonies$ | async) as testimonies" class="max-w-6xl mx-auto">
          <div *ngIf="testimonies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let testimony of testimonies" 
                 class="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100 hover:shadow-xl transition-all hover:-translate-y-2">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {{ testimony.authorName.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">{{ testimony.authorName }}</h3>
                  <p *ngIf="testimony.category" class="text-xs text-green-600">{{ testimony.category }}</p>
                </div>
              </div>
              <h4 class="font-bold text-lg text-gray-900 mb-3">{{ testimony.title }}</h4>
              <p class="text-gray-700 text-sm leading-relaxed line-clamp-4">{{ testimony.content }}</p>
            </div>
          </div>

          <div *ngIf="testimonies.length === 0" class="text-center py-12 bg-gray-50 rounded-xl">
            <p class="text-4xl mb-4">💬</p>
            <p class="text-gray-500">Em breve teremos testemunhos para compartilhar!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 bg-primary-blue text-white text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      <div class="max-w-4xl mx-auto px-4 relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold mb-6">Faça parte desta família</h2>
        <p class="text-xl text-blue-100 mb-8">
          Queremos caminhar com você. Se você procura um lugar para pertencer, aqui é o seu lugar.
        </p>
        <a routerLink="/contato" class="inline-block px-8 py-4 bg-white text-primary-blue rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
          Fale Conosco
        </a>
      </div>
    </section>

    <!-- Modal de Sermão -->
    <div *ngIf="selectedSermon" class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" (click)="closeSermonModal()">
      <div class="max-w-5xl w-full bg-black rounded-lg overflow-hidden shadow-2xl relative" (click)="$event.stopPropagation()">
        <button 
          class="absolute -top-10 right-0 text-white hover:text-gray-300 text-lg font-bold"
          (click)="closeSermonModal()">
          Fechar ✕
        </button>
        
        <div class="aspect-video bg-black flex items-center justify-center">
          <iframe 
            *ngIf="selectedSermon.mediaUrl"
            [src]="sanitizer.bypassSecurityTrustResourceUrl(selectedSermon.mediaUrl.replace('watch?v=', 'embed/'))" 
            class="w-full h-full" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
          <div *ngIf="!selectedSermon.mediaUrl" class="text-white text-center p-8">
            <p class="text-xl">Vídeo não disponível para esta mensagem.</p>
          </div>
        </div>
        
        <div class="bg-white p-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ selectedSermon.title }}</h2>
          <p class="text-gray-600 mt-1">{{ selectedSermon.preacher || selectedSermon.pastor }} • {{ selectedSermon.date | date:'longDate' }}</p>
          <p *ngIf="selectedSermon.scriptureReference || selectedSermon.biblicalText" class="text-purple-600 mt-2">
            📖 {{ selectedSermon.scriptureReference || selectedSermon.biblicalText }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slide-up {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }
    .animate-slide-up {
      animation: slide-up 0.8s ease-out;
      animation-fill-mode: both;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  upcomingEvents$: Observable<EventModel[]>;
  galleryPhotos$: Observable<MediaItem[]>;
  latestWord$: Observable<PastorWord | null>;
  socialActions$: Observable<EventModel[]>;
  latestSermons$: Observable<Sermon[]>;
  stats$: Observable<ChurchStats>;
  birthdays$: Observable<Birthday[]>;
  testimonies$: Observable<Testimony[]>;
  
  loading = true;
  currentPhotoIndex = 0;
  currentYear = new Date().getFullYear();
  selectedSermon: Sermon | null = null;
  private carouselSubscription?: Subscription;

  constructor(
    private eventsService: EventsDatabaseService,
    private mediaService: MediaDatabaseService,
    private pastorService: PastorDatabaseService,
    private membersService: MembersDatabaseService,
    private testimoniesService: TestimoniesDatabaseService,
    public sanitizer: DomSanitizer
  ) {
    // Próximos 3 eventos
    this.upcomingEvents$ = this.eventsService.getEvents().pipe(
      map(events => {
        const now = new Date();
        return events
          .filter(e => e.status === 'scheduled' && new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      })
    );

    // Fotos da galeria (últimas 6 fotos publicadas)
    this.galleryPhotos$ = this.mediaService.getMedia().pipe(
      map(items => items
        .filter(i => i.type === 'photo' && i.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
      )
    );

    // Palavra do pastor mais recente (ativa)
    this.latestWord$ = this.pastorService.getActiveWord().pipe(
      map(word => word || null)
    );

    // Ações solidárias (eventos de categoria Social ou Missão)
    this.socialActions$ = this.eventsService.getEvents().pipe(
      map(events => {
        const now = new Date();
        return events
          .filter(e => 
            (e.category === 'Social' || e.category === 'Missão') && 
            e.status === 'scheduled' && 
            new Date(e.date) >= now
          )
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      })
    );

    // Últimos 4 sermões
    this.latestSermons$ = this.pastorService.getSermons().pipe(
      map(sermons => sermons
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4)
      )
    );

    // Estatísticas da igreja
    this.stats$ = combineLatest([
      this.membersService.getMembers(),
      this.eventsService.getEvents(),
      this.pastorService.getSermons()
    ]).pipe(
      map(([members, events, sermons]) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        return {
          totalMembers: members.filter(m => m.status === 'active').length,
          eventsThisYear: events.filter(e => {
            const eventYear = new Date(e.date).getFullYear();
            return eventYear === currentYear;
          }).length,
          totalSermons: sermons.length,
          socialActions: events.filter(e => 
            (e.category === 'Social' || e.category === 'Missão')
          ).length
        };
      })
    );


    // Aniversariantes do mês
    this.birthdays$ = this.membersService.getMembers().pipe(
      map(members => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        return members
          .filter(m => {
            if (!m.birthDate || m.status !== 'active') return false;
            
            const birthDate = m.birthDate instanceof Date ? m.birthDate : new Date(m.birthDate);
            const birthMonth = birthDate.getMonth();
            
            // Verificar se o aniversário é no mês atual
            return birthMonth === currentMonth;
          })
          .map(m => {
            if (!m.birthDate) return null;
            const birthDate = m.birthDate instanceof Date ? m.birthDate : new Date(m.birthDate);
            return {
              firstName: m.name.split(' ')[0], // Apenas primeiro nome para privacidade
              date: new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
            };
          })
          .filter((b): b is Birthday => b !== null)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      })
    );

    // Testemunhos públicos (últimos 3)
    this.testimonies$ = this.testimoniesService.getPublicTestimonies().pipe(
      map(testimonies => testimonies.slice(0, 3))
    );
  }

  ngOnInit(): void {
    setTimeout(() => this.loading = false, 500);
    
    // Auto-play do carrossel (muda a cada 5 segundos)
    this.carouselSubscription = interval(5000).subscribe(() => {
      this.galleryPhotos$.pipe(take(1)).subscribe(photos => {
        if (photos.length > 0) {
          this.currentPhotoIndex = (this.currentPhotoIndex + 1) % photos.length;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.carouselSubscription?.unsubscribe();
  }

  goToPhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  getDayOfWeek(date: Date): string {
    const days = ['Domingos', 'Segundas', 'Terças', 'Quartas', 'Quintas', 'Sextas', 'Sábados'];
    const d = new Date(date);
    return days[d.getDay()];
  }

  getEventIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Culto': '🙏',
      'Reunião': '📖',
      'Treinamento': '📚',
      'Social': '🎉',
      'Missão': '🌍',
      'Outra': '📅'
    };
    return icons[category] || '📅';
  }

  getSocialIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Social': '🤝',
      'Missão': '🌍',
      'Outra': '❤️'
    };
    return icons[category] || '🎉';
  }

  openSermonModal(sermon: Sermon): void {
    this.selectedSermon = sermon;
  }

  closeSermonModal(): void {
    this.selectedSermon = null;
  }

  getYoutubeThumbnail(url?: string): string | null {
    if (!url) return null;
    
    // Extract YouTube video ID
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  }
}

