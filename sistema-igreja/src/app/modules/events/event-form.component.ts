import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsDatabaseService } from '../../core/services/events-database.service';
import { Event } from '../../shared/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode ? 'Editar Evento' : 'Novo Evento' }}
        </h1>
        <p class="text-sm text-gray-600 mt-2">
          {{ isEditMode ? 'Atualize os dados do evento' : 'Registre um novo evento na Igreja' }}
        </p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Informações Básicas -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Evento *</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Ex: Culto Dominical, Reunião de Diáconos..."
                  class="input-field"
                />
                <span
                  *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
                  class="text-sm text-red-600"
                >
                  Nome é obrigatório (mínimo 3 caracteres)
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select formControlName="category" class="input-field">
                  <option value="">Selecione a categoria...</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
                <span
                  *ngIf="form.get('category')?.invalid && form.get('category')?.touched"
                  class="text-sm text-red-600"
                >
                  Categoria é obrigatória
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select formControlName="status" class="input-field">
                  <option value="">Selecione o status...</option>
                  <option value="scheduled">📅 Agendado</option>
                  <option value="ongoing">🔴 Em Andamento</option>
                  <option value="completed">✅ Concluído</option>
                  <option value="cancelled">❌ Cancelado</option>
                </select>
                <span
                  *ngIf="form.get('status')?.invalid && form.get('status')?.touched"
                  class="text-sm text-red-600"
                >
                  Status é obrigatório
                </span>
              </div>
            </div>
          </div>

          <!-- Data e Hora -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Data e Hora</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input type="date" formControlName="date" class="input-field" />
                <span
                  *ngIf="form.get('date')?.invalid && form.get('date')?.touched"
                  class="text-sm text-red-600"
                >
                  Data é obrigatória
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
                <input type="time" formControlName="time" class="input-field" />
                <span
                  *ngIf="form.get('time')?.invalid && form.get('time')?.touched"
                  class="text-sm text-red-600"
                >
                  Horário é obrigatório
                </span>
              </div>
            </div>
          </div>

          <!-- Local e Capacidade -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Local e Participantes</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Local *</label>
                <input
                  type="text"
                  formControlName="location"
                  placeholder="Ex: Templo Principal, Sala de Reuniões..."
                  class="input-field"
                />
                <span
                  *ngIf="form.get('location')?.invalid && form.get('location')?.touched"
                  class="text-sm text-red-600"
                >
                  Local é obrigatório
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Capacidade Máxima *</label
                >
                <input
                  type="number"
                  formControlName="capacity"
                  placeholder="100"
                  min="1"
                  class="input-field"
                />
                <span
                  *ngIf="form.get('capacity')?.invalid && form.get('capacity')?.touched"
                  class="text-sm text-red-600"
                >
                  Capacidade é obrigatória e deve ser maior que 0
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Registrados *</label>
                <input
                  type="number"
                  formControlName="registered"
                  placeholder="0"
                  min="0"
                  class="input-field"
                />
                <span
                  *ngIf="form.get('registered')?.invalid && form.get('registered')?.touched"
                  class="text-sm text-red-600"
                >
                  Registrados é obrigatório
                </span>
              </div>
            </div>
          </div>

          <!-- Responsáveis -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Responsáveis</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Responsável *</label>
                <input
                  type="text"
                  formControlName="responsible"
                  placeholder="Ex: Pastor João"
                  class="input-field"
                />
                <span
                  *ngIf="form.get('responsible')?.invalid && form.get('responsible')?.touched"
                  class="text-sm text-red-600"
                >
                  Responsável é obrigatório
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Coordenador</label>
                <input
                  type="text"
                  formControlName="coordinator"
                  placeholder="Ex: Diácono Pedro"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Descrição -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Descrição</h3>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Descrição do Evento</label
                >
                <textarea
                  formControlName="description"
                  placeholder="Descreva os detalhes do evento..."
                  rows="4"
                  class="input-field"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  formControlName="notes"
                  placeholder="Adicione observações adicionais..."
                  rows="3"
                  class="input-field"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 justify-end">
            <button type="button" (click)="onCancel()" class="btn-secondary">❌ Cancelar</button>
            <button type="submit" [disabled]="form.invalid" class="btn-primary">
              {{ isEditMode ? '💾 Atualizar' : '➕ Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EventFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  eventId?: string;
  categories: string[] = [];
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsDatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.categories = this.eventsService.getCategories();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = params['id'];
        this.loadEvent(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      time: ['10:00', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      capacity: [100, [Validators.required, Validators.min(1)]],
      registered: [0, [Validators.required, Validators.min(0)]],
      status: ['scheduled', Validators.required],
      responsible: ['', Validators.required],
      coordinator: [''],
      notes: [''],
    });
  }

  private loadEvent(id: string): void {
    this.subscription = this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        if (event) {
          const dateStr = new Date(event.date).toISOString().split('T')[0];
          
          const patchData = {
            name: event.name,
            description: event.description || '',
            date: dateStr,
            time: event.time || '10:00',
            location: event.location,
            category: event.category,
            capacity: Number(event.capacity),
            registered: Number(event.registered),
            status: event.status,
            responsible: event.responsible || '',
            coordinator: event.coordinator || '',
            notes: event.notes || '',
          };

          this.form.patchValue(patchData);
        } else {
          console.error('Evento não encontrado');
          alert('Evento não encontrado!');
          this.router.navigate(['/dashboard/eventos']);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar evento:', error);
        alert('Erro ao carregar evento. Tente novamente.');
        this.router.navigate(['/dashboard/eventos']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const formValue = this.form.value;

    // Combinar data e hora
    const dateTime = new Date(`${formValue.date}T${formValue.time}`);

    const eventData: any = {
      name: formValue.name,
      description: formValue.description || '',
      date: dateTime,
      time: formValue.time,
      location: formValue.location,
      category: formValue.category,
      capacity: Number(formValue.capacity),
      registered: Number(formValue.registered),
      status: formValue.status,
      responsible: formValue.responsible,
      coordinator: formValue.coordinator || '',
      notes: formValue.notes || '',
      churchId: 'church-1',
    };

    try {
      if (this.isEditMode && this.eventId) {
        await this.eventsService.updateEvent(this.eventId, eventData);
        alert('Evento atualizado com sucesso!');
      } else {
        await this.eventsService.addEvent(eventData);
        alert('Evento criado com sucesso!');
      }

      await this.router.navigate(['/dashboard/eventos']);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert(`Erro ao salvar evento: ${error}`);
    }
  }

  async onCancel(): Promise<void> {
    await this.router.navigate(['/dashboard/eventos']);
  }
}
