import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PastorService } from '../../core/services/pastor.service';
import { Sermon } from '../../shared/models';

@Component({
  selector: 'app-pastor-sermon-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{ isEditMode ? '✏️ Editar Sermão' : '📖 Novo Sermão' }}
          </h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            {{ isEditMode ? 'Atualize os dados do sermão' : 'Registre um novo sermão' }}
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Linha 1: Título e Pastor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Título do Sermão *</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Ex: O Poder da Fé"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="form.get('title')?.hasError('required') && form.get('title')?.touched"
            >
              Título é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Pastor *</label>
            <input
              type="text"
              formControlName="pastor"
              placeholder="Ex: João da Silva"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="form.get('pastor')?.hasError('required') && form.get('pastor')?.touched"
            >
              Pastor é obrigatório
            </p>
          </div>
        </div>

        <!-- Linha 2: Texto Bíblico e Categoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Texto Bíblico *</label>
            <input
              type="text"
              formControlName="biblicalText"
              placeholder="Ex: João 3:16"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="
                form.get('biblicalText')?.hasError('required') && form.get('biblicalText')?.touched
              "
            >
              Texto bíblico é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Categoria do Tópico *</label>
            <select formControlName="topicCategory" class="input-field">
              <option value="">Selecione uma categoria</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
            <p
              class="error-message"
              *ngIf="
                form.get('topicCategory')?.hasError('required') &&
                form.get('topicCategory')?.touched
              "
            >
              Categoria é obrigatória
            </p>
          </div>
        </div>

        <!-- Linha 3: Data e Duração -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Data do Sermão *</label>
            <input type="date" formControlName="date" class="input-field" />
            <p
              class="error-message"
              *ngIf="form.get('date')?.hasError('required') && form.get('date')?.touched"
            >
              Data é obrigatória
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Duração (minutos) *</label>
            <input
              type="number"
              formControlName="duration"
              min="1"
              max="180"
              placeholder="Ex: 45"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="form.get('duration')?.hasError('required') && form.get('duration')?.touched"
            >
              Duração é obrigatória
            </p>
          </div>
        </div>

        <!-- Linha 4: Participantes e Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Número de Participantes *</label>
            <input
              type="number"
              formControlName="attendance"
              min="0"
              placeholder="Ex: 50"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="
                form.get('attendance')?.hasError('required') && form.get('attendance')?.touched
              "
            >
              Número de participantes é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="scheduled">📅 Agendado</option>
              <option value="completed">✅ Concluído</option>
              <option value="cancelled">❌ Cancelado</option>
            </select>
          </div>
        </div>

        <!-- Resumo -->
        <div class="space-y-2">
          <label class="label-form">Resumo do Sermão</label>
          <textarea
            formControlName="summary"
            placeholder="Digite um breve resumo do sermão (opcional)"
            rows="3"
            class="input-field resize-none"
          ></textarea>
          <p class="text-xs text-gray-500">
            {{ form.get('summary')?.value?.length || 0 }}/500 caracteres
          </p>
        </div>

        <!-- Notas -->
        <div class="space-y-2">
          <label class="label-form">Notas Adicionais</label>
          <textarea
            formControlName="notes"
            placeholder="Escreva notas ou observações (opcional)"
            rows="3"
            class="input-field resize-none"
          ></textarea>
          <p class="text-xs text-gray-500">
            {{ form.get('notes')?.value?.length || 0 }}/500 caracteres
          </p>
        </div>

        <!-- URL de Áudio/Vídeo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">URL do Áudio</label>
            <input
              type="url"
              formControlName="audioUrl"
              placeholder="https://exemplo.com/audio.mp3"
              class="input-field"
            />
          </div>

          <div class="space-y-2">
            <label class="label-form">URL do Vídeo</label>
            <input
              type="url"
              formControlName="videoUrl"
              placeholder="https://youtube.com/..."
              class="input-field"
            />
          </div>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 pt-6 border-t">
          <button type="submit" [disabled]="!form.valid || isSubmitting" class="btn-primary flex-1">
            {{ isSubmitting ? '⏳ Salvando...' : isEditMode ? '💾 Atualizar' : '✅ Criar' }}
          </button>
          <button type="button" routerLink="/pastor" class="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class PastorSermonFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  sermonId: string | null = null;
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pastorService: PastorService
  ) {}

  ngOnInit(): void {
    this.categories = this.pastorService.getSermonCategories();
    this.initializeForm();
    this.loadSermonIfEditing();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      biblicalText: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1), Validators.max(180)]],
      pastor: ['', [Validators.required, Validators.minLength(3)]],
      topicCategory: ['', Validators.required],
      status: ['scheduled', Validators.required],
      attendance: [0, [Validators.required, Validators.min(0)]],
      summary: [''],
      notes: [''],
      audioUrl: [''],
      videoUrl: [''],
    });
  }

  loadSermonIfEditing(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.sermonId = id;
        this.pastorService.getSermons().subscribe((sermons) => {
          const sermon = sermons.find((s) => s.id === id);
          if (sermon) {
            this.form.patchValue({
              title: sermon.title,
              biblicalText: sermon.biblicalText,
              date: this.formatDateForInput(sermon.date),
              duration: sermon.duration,
              pastor: sermon.pastor,
              topicCategory: sermon.topicCategory,
              status: sermon.status,
              attendance: sermon.attendance,
              summary: sermon.summary,
              notes: sermon.notes,
              audioUrl: sermon.audioUrl || '',
              videoUrl: sermon.videoUrl || '',
            });
          }
        });
      }
    });
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    if (this.isEditMode && this.sermonId) {
      this.pastorService.updateSermon(this.sermonId, formValue);
    } else {
      this.pastorService.createSermon(formValue);
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/pastor']);
    }, 500);
  }
}
