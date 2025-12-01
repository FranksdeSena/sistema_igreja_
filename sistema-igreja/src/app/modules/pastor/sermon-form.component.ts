import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PastorDatabaseService } from '../../core/services/pastor-database.service';
import { Sermon } from '../../shared/models/pastor.model';

@Component({
  selector: 'app-sermon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ isEditing ? 'Editar Sermão' : 'Novo Sermão' }}
        </h2>
        <a routerLink="../" class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
          Voltar para lista
        </a>
      </div>

      <form [formGroup]="sermonForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Título -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Sermão</label>
            <input type="text" formControlName="title"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Ex: O Poder da Fé">
          </div>

          <!-- Pregador -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pregador</label>
            <input type="text" formControlName="preacher"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Ex: Pr. João Silva">
          </div>

          <!-- Data -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
            <input type="date" formControlName="date"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
          </div>

          <!-- Série (Opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Série (Opcional)</label>
            <input type="text" formControlName="series"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Ex: Vida no Espírito">
          </div>

          <!-- Passagem Bíblica (Opcional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passagem Bíblica (Opcional)</label>
            <input type="text" formControlName="scriptureReference"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="Ex: Romanos 8:28">
          </div>

          <!-- Link de Mídia (Opcional) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link de Vídeo/Áudio (Opcional)</label>
            <input type="text" formControlName="mediaUrl"
                   class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                   placeholder="https://youtube.com/...">
          </div>

          <!-- Notas/Resumo (Opcional) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas / Resumo (Opcional)</label>
            <textarea formControlName="notes" rows="4"
                      class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                      placeholder="Breve resumo da mensagem..."></textarea>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end pt-6 space-x-4">
          <a routerLink="../" class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </a>
          <button type="submit" 
                  [disabled]="sermonForm.invalid || isSubmitting"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            <span *ngIf="isSubmitting" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Sermão' : 'Criar Sermão') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class SermonFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pastorService = inject(PastorDatabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sermonForm: FormGroup;
  isSubmitting = false;
  isEditing = false;
  sermonId?: string;

  constructor() {
    this.sermonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      preacher: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      series: [''],
      scriptureReference: [''],
      mediaUrl: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.sermonId = this.route.snapshot.params['id'];
    if (this.sermonId) {
      this.isEditing = true;
      this.loadSermon(this.sermonId);
    }
  }

  loadSermon(id: string) {
    this.pastorService.getSermonById(id).subscribe(sermon => {
      if (sermon) {
        this.sermonForm.patchValue(sermon);
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  async onSubmit() {
    if (this.sermonForm.valid) {
      this.isSubmitting = true;
      try {
        const sermonData = this.sermonForm.value;

        if (this.isEditing && this.sermonId) {
          await this.pastorService.updateSermon(this.sermonId, sermonData);
        } else {
          await this.pastorService.addSermon(sermonData);
        }
        
        this.router.navigate(['../'], { relativeTo: this.route });
        
      } catch (error) {
        console.error('Erro ao salvar sermão:', error);
        alert('Erro ao salvar. Tente novamente.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
