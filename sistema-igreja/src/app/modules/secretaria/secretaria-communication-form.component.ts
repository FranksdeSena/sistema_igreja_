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
  selector: 'app-secretaria-communication-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
            {{ isEditMode ? '✏️ Editar Comunicação' : '💬 Nova Comunicação' }}
          </h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            {{ isEditMode ? 'Atualize os dados da comunicação' : 'Registre uma nova comunicação' }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card space-y-6">
        <!-- Linha 1: Tipo e Assunto -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Tipo de Comunicação *</label>
            <select formControlName="type" (change)="onTypeChange()" class="input-field">
              <option value="email">📧 Email</option>
              <option value="circular">📋 Circular</option>
              <option value="aviso">⚠️ Aviso</option>
              <option value="boletim">📰 Boletim</option>
              <option value="whatsapp">💬 WhatsApp</option>
            </select>
            <p
              class="error-message"
              *ngIf="form.get('type')?.hasError('required') && form.get('type')?.touched"
            >
              Tipo é obrigatório
            </p>
          </div>

          <div class="space-y-2">
            <label class="label-form">Assunto *</label>
            <input
              type="text"
              formControlName="subject"
              placeholder="Ex: Alteração de Horário"
              class="input-field"
            />
            <p
              class="error-message"
              *ngIf="form.get('subject')?.hasError('required') && form.get('subject')?.touched"
            >
              Assunto é obrigatório
            </p>
          </div>
        </div>

        <!-- Número de Telefone (condicional para WhatsApp) -->
        <div class="space-y-2" *ngIf="form.get('type')?.value === 'whatsapp'">
          <label class="label-form">Número de Telefone (WhatsApp) *</label>
          <input
            type="tel"
            formControlName="phoneNumber"
            placeholder="Ex: +55 11 98765-4321"
            class="input-field"
          />
          <p
            class="error-message"
            *ngIf="
              form.get('phoneNumber')?.hasError('required') && form.get('phoneNumber')?.touched
            "
          >
            Número de telefone é obrigatório para WhatsApp
          </p>
        </div>

        <!-- Linha 2: Destinatário -->
        <div class="space-y-2">
          <label class="label-form">Destinatário *</label>
          <select formControlName="recipient" (change)="onRecipientChange()" class="input-field">
            <option value="todos">👥 Todos</option>
            <option value="pastores">🙏 Pastores</option>
            <option value="lideranca">👔 Liderança</option>
            <option value="membros">👨‍👩‍👧‍👦 Membros</option>
            <option value="custom">✏️ Personalizado</option>
          </select>
        </div>

        <!-- Emails Personalizados (condicional) -->
        <div class="space-y-2" *ngIf="form.get('recipient')?.value === 'custom'">
          <label class="label-form">Emails (separados por vírgula)</label>
          <textarea
            formControlName="recipientListInput"
            placeholder="email@exemplo.com, outro@exemplo.com"
            rows="3"
            class="input-field resize-none"
          ></textarea>
        </div>

        <!-- Mensagem -->
        <div class="space-y-2">
          <label class="label-form">Mensagem *</label>
          <textarea
            formControlName="message"
            placeholder="Escreva a mensagem..."
            rows="5"
            class="input-field resize-none"
          ></textarea>
          <p
            class="error-message"
            *ngIf="form.get('message')?.hasError('required') && form.get('message')?.touched"
          >
            Mensagem é obrigatória
          </p>
          <p class="text-xs text-gray-500">
            {{ form.get('message')?.value?.length || 0 }}/1000 caracteres
          </p>
        </div>

        <!-- Linha 3: Status e Data -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="label-form">Status *</label>
            <select formControlName="status" class="input-field">
              <option value="rascunho">✏️ Rascunho</option>
              <option value="agendado">📅 Agendado</option>
              <option value="enviado">✅ Enviado</option>
            </select>
          </div>

          <div class="space-y-2" *ngIf="form.get('status')?.value === 'agendado'">
            <label class="label-form">Data Agendada</label>
            <input type="datetime-local" formControlName="scheduledDate" class="input-field" />
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
          <button
            *ngIf="isEditMode && form.get('status')?.value === 'rascunho'"
            type="button"
            (click)="onSendNow()"
            class="btn-success flex-1"
          >
            📤 Enviar Agora
          </button>
          <button type="button" routerLink="/secretaria" class="btn-secondary flex-1">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class SecretariaCommunicationFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  communicationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private secretariaService: SecretariaService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCommunicationIfEditing();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      type: ['email', Validators.required],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: [''],
      recipient: ['todos', Validators.required],
      recipientListInput: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
      status: ['rascunho', Validators.required],
      scheduledDate: [''],
      notes: [''],
    });
  }

  onRecipientChange(): void {
    const recipientControl = this.form.get('recipientListInput');
    if (this.form.get('recipient')?.value === 'custom') {
      recipientControl?.setValidators([Validators.required]);
    } else {
      recipientControl?.clearValidators();
    }
    recipientControl?.updateValueAndValidity();
  }

  onTypeChange(): void {
    const phoneControl = this.form.get('phoneNumber');
    if (this.form.get('type')?.value === 'whatsapp') {
      phoneControl?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      phoneControl?.clearValidators();
    }
    phoneControl?.updateValueAndValidity();
  }

  loadCommunicationIfEditing(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.communicationId = id;
        this.secretariaService.getCommunications().subscribe((comms) => {
          const comm = comms.find((c) => c.id === id);
          if (comm) {
            this.form.patchValue({
              type: comm.type,
              subject: comm.subject,
              phoneNumber: comm.phoneNumber || '',
              recipient: comm.recipient,
              recipientListInput: comm.recipientList?.join(', ') || '',
              message: comm.message,
              status: comm.status,
              scheduledDate: comm.scheduledDate
                ? this.formatDateTimeForInput(comm.scheduledDate)
                : '',
              notes: comm.notes,
            });
          }
        });
      }
    });
  }

  private formatDateTimeForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSendNow(): void {
    if (this.communicationId) {
      this.secretariaService.sendCommunication(this.communicationId);
      this.router.navigate(['/secretaria']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;
    const recipientList = formValue.recipientListInput
      ? formValue.recipientListInput.split(',').map((e: string) => e.trim())
      : undefined;

    const data = {
      type: formValue.type,
      subject: formValue.subject,
      phoneNumber: formValue.phoneNumber || undefined,
      recipient: formValue.recipient,
      recipientList,
      message: formValue.message,
      status: formValue.status,
      scheduledDate: formValue.scheduledDate ? new Date(formValue.scheduledDate) : undefined,
      notes: formValue.notes,
      sender: 'Secretário',
      readBy: [],
      responseCount: 0,
      churchId: 'church-1',
    };

    if (this.isEditMode && this.communicationId) {
      this.secretariaService.updateCommunication(this.communicationId, data);
    } else {
      this.secretariaService.createCommunication(data);
    }

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/secretaria']);
    }, 500);
  }
}
