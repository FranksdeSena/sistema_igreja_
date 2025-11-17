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
  selector: 'app-secretaria-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{
              isViewMode
                ? '👁️ Visualizar Relatório'
                : isEditMode
                ? '✏️ Editar Relatório'
                : '📊 Novo Relatório'
            }}
          </h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            {{
              isViewMode
                ? 'Visualize os detalhes do relatório'
                : isEditMode
                ? 'Atualize os dados do relatório'
                : 'Registre um novo relatório'
            }}
          </p>
        </div>
      </div>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="card space-y-6"
        [attr.readonly]="isViewMode"
      >
        <!-- Linha 1: Título e Tipo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Título do Relatório *</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Ex: Relatório Financeiro - Outubro 2025"
              class="input-field"
              [readonly]="isViewMode"
            />
            <p
              class="error-message"
              *ngIf="form.get('title')?.hasError('required') && form.get('title')?.touched"
            >
              Título é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Tipo de Relatório *</label>
            <select formControlName="type" class="input-field" [disabled]="isViewMode">
              <option value="financial">💰 Financeiro</option>
              <option value="attendance">📊 Frequência</option>
              <option value="membership">👥 Membros</option>
              <option value="events">🎉 Eventos</option>
              <option value="pastoral">🙏 Pastoral</option>
              <option value="custom">📋 Personalizado</option>
            </select>
            <p
              class="error-message"
              *ngIf="form.get('type')?.hasError('required') && form.get('type')?.touched"
            >
              Tipo é obrigatório
            </p>
          </div>
        </div>

        <!-- Linha 2: Período -->
        <div class="space-y-2">
          <label class="label-form">Período *</label>
          <input
            type="text"
            formControlName="period"
            placeholder="Ex: Outubro 2025"
            class="input-field"
            [readonly]="isViewMode"
          />
          <p
            class="error-message"
            *ngIf="form.get('period')?.hasError('required') && form.get('period')?.touched"
          >
            Período é obrigatório
          </p>
        </div>

        <!-- Linha 3: Datas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Data de Início *</label>
            <input
              type="date"
              formControlName="startDate"
              class="input-field"
              [readonly]="isViewMode"
            />
            <p
              class="error-message"
              *ngIf="form.get('startDate')?.hasError('required') && form.get('startDate')?.touched"
            >
              Data de início é obrigatória
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Data de Término *</label>
            <input
              type="date"
              formControlName="endDate"
              class="input-field"
              [readonly]="isViewMode"
            />
            <p
              class="error-message"
              *ngIf="form.get('endDate')?.hasError('required') && form.get('endDate')?.touched"
            >
              Data de término é obrigatória
            </p>
          </div>
        </div>

        <!-- Conteúdo -->
        <div class="space-y-2">
          <label class="label-form">Conteúdo do Relatório *</label>
          <textarea
            formControlName="content"
            placeholder="Escreva o conteúdo do relatório..."
            rows="8"
            class="input-field resize-none"
            [readonly]="isViewMode"
          ></textarea>
          <p
            class="error-message"
            *ngIf="form.get('content')?.hasError('required') && form.get('content')?.touched"
          >
            Conteúdo é obrigatório
          </p>
          <p class="text-xs text-gray-500">
            {{ form.get('content')?.value?.length || 0 }}/5000 caracteres
          </p>
        </div>

        <!-- Linha 4: Status -->
        <div class="space-y-2">
          <label class="label-form">Status *</label>
          <select formControlName="status" class="input-field" [disabled]="isViewMode">
            <option value="rascunho">✏️ Rascunho</option>
            <option value="finalizado">✅ Finalizado</option>
            <option value="enviado">📤 Enviado</option>
          </select>
        </div>

        <!-- Botões -->
        <div class="flex gap-3 pt-6 border-t" *ngIf="!isViewMode">
          <button type="submit" [disabled]="!form.valid || isSubmitting" class="btn-primary flex-1">
            {{ isSubmitting ? '⏳ Salvando...' : isEditMode ? '💾 Atualizar' : '✅ Criar' }}
          </button>
          <button type="button" routerLink="/secretaria" class="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>

        <div class="flex gap-3 pt-6 border-t" *ngIf="isViewMode">
          <button type="button" (click)="onEdit()" class="btn-primary flex-1">✏️ Editar</button>
          <button type="button" routerLink="/secretaria" class="btn-secondary flex-1">
            ⬅️ Voltar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SecretariaReportFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isViewMode = false;
  isSubmitting = false;
  reportId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private secretariaService: SecretariaService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadReportIfNeeded();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      type: ['financial', Validators.required],
      period: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(20)]],
      status: ['rascunho', Validators.required],
    });
  }

  loadReportIfNeeded(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.reportId = id;

        // Detectar se é modo visualizar ou editar
        const routePath = this.route.snapshot.routeConfig?.path || '';
        this.isViewMode = routePath.includes('visualizar');
        this.isEditMode = routePath.includes('editar');

        this.secretariaService.getReports().subscribe((reports) => {
          const report = reports.find((r) => r.id === id);
          if (report) {
            this.form.patchValue({
              title: report.title,
              type: report.type,
              period: report.period,
              startDate: this.formatDateForInput(report.startDate),
              endDate: this.formatDateForInput(report.endDate),
              content: report.content,
              status: report.status,
            });

            if (this.isViewMode) {
              this.form.disable();
            } else if (this.isEditMode) {
              this.form.enable();
            }
          }
        });
      }
    });
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  onEdit(): void {
    this.isViewMode = false;
    this.isEditMode = true;
    this.form.enable();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    const data = {
      title: formValue.title,
      type: formValue.type,
      period: formValue.period,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      content: formValue.content,
      status: formValue.status,
      summary: {
        totalItems: 0,
        highlights: [],
        metrics: {},
      },
      generatedBy: 'Secretário',
      generatedDate: new Date(),
      churchId: 'church-1',
    };

    if (this.isEditMode && this.reportId) {
      this.secretariaService.updateReport(this.reportId, data);
    } else {
      this.secretariaService.createReport(data);
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/secretaria']);
    }, 500);
  }
}
