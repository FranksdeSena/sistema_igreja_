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

@Component({
  selector: 'app-pastor-visit-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{ isEditMode ? '✏️ Editar Visita' : '🤝 Nova Visita Pastoral' }}
          </h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            {{ isEditMode ? 'Atualize os dados da visita' : 'Registre uma nova visita pastoral' }}
          </p>
        </div>
      </div>

      <!-- Form Card -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Linha 1: Membro e Data -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Nome do Membro *</label>
            <input
              type="text"
              formControlName="memberName"
              placeholder="Ex: João da Silva"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="
                form.get('memberName')?.hasError('required') && form.get('memberName')?.touched
              "
            >
              Nome do membro é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Data da Visita *</label>
            <input type="date" formControlName="date" class="input-field" />
            <p
              class="error-message"
              *ngIf="form.get('date')?.hasError('required') && form.get('date')?.touched"
            >
              Data é obrigatória
            </p>
          </div>
        </div>

        <!-- Linha 2: Hora e Pastor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Horário da Visita *</label>
            <input type="time" formControlName="time" class="input-field" />
            <p
              class="error-message"
              *ngIf="form.get('time')?.hasError('required') && form.get('time')?.touched"
            >
              Horário é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Pastor *</label>
            <input
              type="text"
              formControlName="pastor"
              placeholder="Ex: Maria Santos"
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

        <!-- Linha 3: Tipo e Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Tipo de Visita *</label>
            <select formControlName="visitType" class="input-field">
              <option value="">Selecione um tipo</option>
              <option *ngFor="let type of visitTypes" [value]="type">{{ type }}</option>
            </select>
            <p
              class="error-message"
              *ngIf="form.get('visitType')?.hasError('required') && form.get('visitType')?.touched"
            >
              Tipo de visita é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="scheduled">📅 Agendada</option>
              <option value="completed">✅ Concluída</option>
              <option value="cancelled">❌ Cancelada</option>
            </select>
          </div>
        </div>

        <!-- Assunto da Visita -->
        <div class="space-y-2">
          <label class="label-form">Assunto da Visita *</label>
          <input
            type="text"
            formControlName="subject"
            placeholder="Ex: Aconselhamento, Encorajamento, etc"
            class="input-field"
          />
          <p
            class="error-message"
            *ngIf="form.get('subject')?.hasError('required') && form.get('subject')?.touched"
          >
            Assunto é obrigatório
          </p>
        </div>

        <!-- Resultado da Visita -->
        <div class="space-y-2">
          <label class="label-form">Resultado da Visita</label>
          <textarea
            formControlName="outcome"
            placeholder="Descreva o resultado e observações da visita (opcional)"
            rows="3"
            class="input-field resize-none"
          ></textarea>
          <p class="text-xs text-gray-500">
            {{ form.get('outcome')?.value?.length || 0 }}/500 caracteres
          </p>
        </div>

        <!-- Acompanhamento Necessário -->
        <div class="space-y-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              formControlName="followUpNeeded"
              class="w-5 h-5 rounded border-gray-300"
            />
            <span class="text-sm text-gray-700">Acompanhamento necessário?</span>
          </label>
        </div>

        <!-- Data de Acompanhamento (condicional) -->
        <div class="space-y-2" *ngIf="form.get('followUpNeeded')?.value">
          <label class="label-form">Data do Acompanhamento</label>
          <input type="date" formControlName="followUpDate" class="input-field" />
        </div>

        <!-- Notas Adicionais -->
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
export class PastorVisitFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  visitId: string | null = null;
  visitTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pastorService: PastorService
  ) {}

  ngOnInit(): void {
    this.visitTypes = this.pastorService.getVisitTypes();
    this.initializeForm();
    this.loadVisitIfEditing();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      memberName: ['', [Validators.required, Validators.minLength(3)]],
      memberId: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      pastor: ['', [Validators.required, Validators.minLength(3)]],
      visitType: ['', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      outcome: [''],
      status: ['scheduled', Validators.required],
      followUpNeeded: [false],
      followUpDate: [''],
      notes: [''],
    });
  }

  loadVisitIfEditing(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.visitId = id;
        this.pastorService.getVisits().subscribe((visits) => {
          const visit = visits.find((v) => v.id === id);
          if (visit) {
            this.form.patchValue({
              memberName: visit.memberName,
              memberId: visit.memberId,
              date: this.formatDateForInput(visit.date),
              time: visit.time,
              pastor: visit.pastor,
              visitType: visit.visitType,
              subject: visit.subject,
              outcome: visit.outcome,
              status: visit.status,
              followUpNeeded: visit.followUpNeeded,
              followUpDate: visit.followUpDate ? this.formatDateForInput(visit.followUpDate) : '',
              notes: visit.notes,
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

    // Se followUpNeeded for false, limpar followUpDate
    if (!formValue.followUpNeeded) {
      formValue.followUpDate = null;
    }

    if (this.isEditMode && this.visitId) {
      this.pastorService.updateVisit(this.visitId, formValue);
    } else {
      this.pastorService.createVisit(formValue);
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/pastor']);
    }, 500);
  }
}
