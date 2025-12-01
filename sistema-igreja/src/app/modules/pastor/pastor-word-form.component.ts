import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PastorDatabaseService } from '../../core/services/pastor-database.service';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { PastorWord } from '../../shared/models/pastor.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pastor-word-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Palavra do Pastor</h2>
      
      <div *ngIf="currentWord" class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-blue-800">Palavra Ativa Atual</h3>
            <p class="text-sm text-gray-600 mt-1">Publicada em: {{ currentWord.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Ativa no Dashboard</span>
        </div>
        <p class="mt-2 font-medium text-gray-800">{{ currentWord.title }}</p>
      </div>

      <form [formGroup]="wordForm" (ngSubmit)="onSubmit()">
        <div class="space-y-6">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" formControlName="title"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Ex: Uma Palavra de Esperança">
          </div>

          <!-- Conteúdo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea formControlName="content" rows="6"
                      class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                      placeholder="Escreva a mensagem aqui..."></textarea>
          </div>

          <!-- Imagem URL (Opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Opcional)</label>
            <input type="text" formControlName="imageUrl"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="https://exemplo.com/imagem.jpg">
          </div>

          <!-- Checkbox Ativo -->
          <div class="flex items-center">
            <input type="checkbox" id="isActive" formControlName="isActive"
                   class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
            <label for="isActive" class="ml-2 text-sm text-gray-700">
              Definir como Palavra Ativa (substituirá a atual no Dashboard)
            </label>
          </div>

          <!-- Botões -->
          <div class="flex justify-end pt-4">
            <button type="submit" 
                    [disabled]="wordForm.invalid || isSubmitting"
                    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              <span *ngIf="isSubmitting" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isSubmitting ? 'Salvando...' : 'Publicar Palavra' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class PastorWordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pastorService = inject(PastorDatabaseService);
  private authService = inject(FirebaseAuthService);

  wordForm: FormGroup;
  isSubmitting = false;
  currentWord?: PastorWord;

  constructor() {
    this.wordForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadCurrentWord();
  }

  loadCurrentWord() {
    this.pastorService.getActiveWord().subscribe(word => {
      this.currentWord = word;
      if (word) {
        // Opcional: Preencher o formulário com a palavra atual para edição
        // this.wordForm.patchValue({
        //   title: word.title,
        //   content: word.content,
        //   imageUrl: word.imageUrl,
        //   isActive: word.isActive
        // });
      }
    });
  }

  async onSubmit() {
    if (this.wordForm.valid) {
      this.isSubmitting = true;
      try {
        const currentUser = await firstValueFrom(this.authService.currentUser$);
        
        if (!currentUser) {
          throw new Error('Usuário não autenticado');
        }

        const wordData = {
          ...this.wordForm.value,
          authorId: currentUser.id,
          authorName: currentUser.full_name
        };

        await this.pastorService.addWord(wordData);
        
        // Limpar formulário mas manter isActive true por padrão
        this.wordForm.reset({ isActive: true });
        alert('Palavra do Pastor publicada com sucesso!');
        
      } catch (error) {
        console.error('Erro ao publicar palavra:', error);
        alert('Erro ao publicar. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
