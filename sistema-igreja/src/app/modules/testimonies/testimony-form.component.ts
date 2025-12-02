import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TestimoniesDatabaseService } from '../../core/services/testimonies-database.service';

@Component({
  selector: 'app-testimony-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Novo Testemunho</h1>

      <form [formGroup]="testimonyForm" (ngSubmit)="onSubmit()" class="bg-white rounded-lg shadow p-6 space-y-6">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Autor *</label>
          <input 
            type="text" 
            formControlName="authorName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome completo">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
          <input 
            type="text" 
            formControlName="title"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Como Deus transformou minha vida">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select 
            formControlName="category"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Selecione...</option>
            <option value="Cura">Cura</option>
            <option value="Salvação">Salvação</option>
            <option value="Provisão">Provisão</option>
            <option value="Família">Família</option>
            <option value="Libertação">Libertação</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Testemunho *</label>
          <textarea 
            formControlName="content"
            rows="8"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Conte sua história de transformação..."></textarea>
        </div>

        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              formControlName="isApproved"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">Aprovar automaticamente</span>
          </label>

          <label class="flex items-center gap-2">
            <input 
              type="checkbox" 
              formControlName="isPublic"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-700">Publicar no site</span>
          </label>
        </div>

        <div class="flex gap-4 pt-4">
          <button 
            type="submit"
            [disabled]="!testimonyForm.valid || saving"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
            {{ saving ? 'Salvando...' : 'Salvar Testemunho' }}
          </button>
          <button 
            type="button"
            (click)="cancel()"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class TestimonyFormComponent {
  testimonyForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private testimoniesService: TestimoniesDatabaseService,
    private router: Router
  ) {
    this.testimonyForm = this.fb.group({
      authorName: ['', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: [''],
      isApproved: [false],
      isPublic: [false]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.testimonyForm.valid) {
      this.saving = true;
      try {
        await this.testimoniesService.addTestimony(this.testimonyForm.value);
        alert('Testemunho salvo com sucesso!');
        this.router.navigate(['/testemunhos']);
      } catch (error) {
        console.error('Erro ao salvar testemunho:', error);
        alert('Erro ao salvar testemunho. Tente novamente.');
      } finally {
        this.saving = false;
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/testemunhos']);
  }
}
