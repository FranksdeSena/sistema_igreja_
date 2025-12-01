import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PastorDatabaseService } from '../../../../core/services/pastor-database.service';
import { PastorWord } from '../../../../shared/models/pastor.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pastor-word-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg overflow-hidden text-white relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>

      <div class="relative p-6 md:p-8">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center space-x-2">
            <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold">Palavra do Pastor</h2>
          </div>
          
          <!-- Botão para editar (apenas se tiver permissão, mas aqui simplificado) -->
          <a routerLink="/dashboard/pastor/word" class="text-white/80 hover:text-white transition-colors text-sm font-medium flex items-center">
            Gerenciar
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <ng-container *ngIf="activeWord$ | async as word; else loadingOrEmpty">
          <div class="mt-4">
            <h3 class="text-2xl font-bold mb-3">{{ word.title }}</h3>
            
            <div class="prose prose-invert max-w-none mb-6">
              <p class="text-blue-100 leading-relaxed line-clamp-4 md:line-clamp-none">
                {{ word.content }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-white/20">
              <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                  {{ word.authorName.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-sm">{{ word.authorName }}</p>
                  <p class="text-blue-200 text-xs">{{ word.createdAt | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
              
              <button (click)="openModal(word)" class="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm shadow-sm">
                Ler Completo
              </button>
            </div>
          </div>
        </ng-container>

        <ng-template #loadingOrEmpty>
          <div class="py-8 text-center text-blue-100">
            <p>Nenhuma palavra ativa no momento.</p>
            <p class="text-sm mt-2 opacity-75">Que tal adicionar uma mensagem de fé hoje?</p>
            <a routerLink="/dashboard/pastor/word" class="inline-block mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm">
              Adicionar Palavra
            </a>
          </div>
        </ng-template>
      </div>

      <!-- Modal de Leitura Completa -->
      <div *ngIf="selectedWord" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" (click)="closeModal()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="p-6 md:p-8">
            <div class="flex justify-between items-start mb-6">
              <div>
                <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">Palavra do Pastor</span>
                <h2 class="text-3xl font-bold text-gray-900">{{ selectedWord.title }}</h2>
                <p class="text-gray-500 text-sm mt-1">
                  Por {{ selectedWord.authorName }} • {{ selectedWord.createdAt | date:'dd/MM/yyyy' }}
                </p>
              </div>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {{ selectedWord.content }}
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button (click)="closeModal()" class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PastorWordWidgetComponent {
  private pastorService = inject(PastorDatabaseService);
  activeWord$: Observable<PastorWord | undefined> = this.pastorService.getActiveWord();
  
  selectedWord: PastorWord | null = null;

  openModal(word: PastorWord) {
    this.selectedWord = word;
    document.body.style.overflow = 'hidden'; // Previne scroll do body
  }

  closeModal() {
    this.selectedWord = null;
    document.body.style.overflow = ''; // Restaura scroll
  }
}
