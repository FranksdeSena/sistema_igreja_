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
import { SecretariaService } from '../../core/services/secretaria.service';

@Component({
  selector: 'app-secretaria-document-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{ isEditMode ? '✏️ Editar Documento' : '📄 Novo Documento' }}
          </h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            {{ isEditMode ? 'Atualize os dados do documento' : 'Registre um novo documento' }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Linha 1: Título e Categoria -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Título do Documento *</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Ex: Regulamento Interno"
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
            <label class="label-form">Categoria *</label>
            <select formControlName="category" class="input-field">
              <option value="">Selecione uma categoria</option>
              <option value="ata">Ata</option>
              <option value="regulamento">Regulamento</option>
              <option value="politica">Política</option>
              <option value="formulario">Formulário</option>
              <option value="outro">Outro</option>
            </select>
            <p
              class="error-message"
              *ngIf="form.get('category')?.hasError('required') && form.get('category')?.touched"
            >
              Categoria é obrigatória
            </p>
          </div>
        </div>

        <!-- Descrição -->
        <div class="space-y-2">
          <label class="label-form">Descrição *</label>
          <textarea
            formControlName="description"
            placeholder="Descreva o documento..."
            rows="3"
            class="input-field resize-none"
          ></textarea>
          <p
            class="error-message"
            *ngIf="
              form.get('description')?.hasError('required') && form.get('description')?.touched
            "
          >
            Descrição é obrigatória
          </p>
          <p class="text-xs text-gray-500">
            {{ form.get('description')?.value?.length || 0 }}/500 caracteres
          </p>
        </div>

        <!-- Status e Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">⏸️ Inativo</option>
              <option value="arquivo">📦 Arquivo</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="label-form">Tags (separadas por vírgula)</label>
            <input
              type="text"
              formControlName="tagsInput"
              placeholder="Ex: regulamento, 2025, importante"
              class="input-field"
            />
            <p class="text-xs text-gray-500">Digite as tags separadas por vírgula</p>
          </div>
        </div>

        <!-- Notas -->
        <div class="space-y-2">
          <label class="label-form">Notas</label>
          <textarea
            formControlName="notes"
            placeholder="Notas adicionais..."
            rows="2"
            class="input-field resize-none"
          ></textarea>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 pt-6 border-t">
          <button type="submit" [disabled]="!form.valid || isSubmitting" class="btn-primary flex-1">
            {{ isSubmitting ? '⏳ Salvando...' : isEditMode ? '💾 Atualizar' : '✅ Criar' }}
          </button>
          <button type="button" routerLink="/secretaria" class="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SecretariaDocumentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  documentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private secretariaService: SecretariaService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDocumentIfEditing();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['ativo', Validators.required],
      tagsInput: [''],
      notes: [''],
    });
  }

  loadDocumentIfEditing(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.documentId = id;
        this.secretariaService.getDocuments().subscribe((docs) => {
          const doc = docs.find((d) => d.id === id);
          if (doc) {
            this.form.patchValue({
              title: doc.title,
              category: doc.category,
              description: doc.description,
              status: doc.status,
              tagsInput: doc.tags.join(', '),
              notes: doc.notes,
            });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;
    const tags = formValue.tagsInput
      ? formValue.tagsInput.split(',').map((t: string) => t.trim())
      : [];

    const data = {
      title: formValue.title,
      category: formValue.category,
      description: formValue.description,
      status: formValue.status,
      tags,
      notes: formValue.notes,
      uploadedBy: 'Admin',
      uploadDate: new Date(),
      lastModified: new Date(),
      version: this.isEditMode ? 2 : 1,
      churchId: 'church-1',
      fileName: `${formValue.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      fileUrl: '#',
      fileSize: 0,
    };

    if (this.isEditMode && this.documentId) {
      this.secretariaService.updateDocument(this.documentId, data);
    } else {
      this.secretariaService.createDocument(data);
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/secretaria']);
    }, 500);
  }
}
