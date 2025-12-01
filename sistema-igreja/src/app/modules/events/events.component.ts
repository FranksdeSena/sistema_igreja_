import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventsDatabaseService } from '../../core/services/events-database.service';
import { Event, EventSummary } from '../../shared/models';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Gestão de Eventos</h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            Organize e acompanhe os eventos da Igreja
          </p>
        </div>
        <button
          routerLink="novo"
          class="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <span class="text-lg">➕</span>
          <span class="hidden md:inline">Novo Evento</span>
          <span class="md:hidden">Novo</span>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- Total Eventos -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Eventos</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ (summary$ | async)?.totalEvents || 0 }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📅</span>
          </div>
        </div>

        <!-- Próximos Eventos -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Próximos</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-blue-600 break-words">
              {{ (summary$ | async)?.upcomingEvents || 0 }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⏳</span>
          </div>
        </div>

        <!-- Eventos Concluídos -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Concluídos</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-green-600 break-words">
              {{ (summary$ | async)?.completedEvents || 0 }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">✅</span>
          </div>
        </div>

      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            [formControl]="searchControl"
            placeholder="Pesquisar por nome, local ou responsável..."
            class="input-field"
          />
          <select [formControl]="categoryControl" class="input-field">
            <option value="">Todas as Categorias</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
          <select [formControl]="statusControl" class="input-field">
            <option value="">Todos os Status</option>
            <option value="scheduled">📅 Agendado</option>
            <option value="ongoing">🔴 Em Andamento</option>
            <option value="completed">✅ Concluído</option>
            <option value="cancelled">❌ Cancelado</option>
          </select>
        </div>
      </div>

      <!-- Tabela de Eventos (Desktop) -->
      <div class="hidden md:block card-hover overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Local</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of filteredEvents$ | async" class="border-b hover:bg-gray-50">
              <td class="px-4 py-3 text-xs md:text-sm text-gray-900">
                {{ event.date | date : 'dd/MM/yyyy' }}
              </td>
              <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                {{ event.name }}
              </td>
              <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                <span class="badge">{{ event.category }}</span>
              </td>
              <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ event.location }}</td>

              <td class="px-4 py-3 text-xs md:text-sm">
                <span [ngClass]="getStatusBadgeClass(event.status)">
                  {{ getStatusLabel(event.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex gap-2 justify-center">
                  <a
                    [routerLink]="['editar', event.id]"
                    class="text-primary-blue hover:text-blue-700 text-sm"
                  >
                    ✏️
                  </a>
                  <button
                    (click)="onDelete(event.id)"
                    class="text-red-600 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards de Eventos (Mobile) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let event of filteredEvents$ | async" class="card-hover">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ event.name }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ event.date | date : 'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <span [ngClass]="getStatusBadgeClass(event.status)" class="text-xs">
              {{ getStatusLabel(event.status) }}
            </span>
          </div>
          <div class="flex gap-2 mb-3 flex-wrap">
            <span class="badge text-xs">{{ event.category }}</span>
            <span class="text-xs text-gray-600">📍 {{ event.location }}</span>
          </div>

          <div class="flex gap-2">
            <a [routerLink]="['editar', event.id]" class="flex-1 btn-primary text-xs text-center">
              ✏️ Editar
            </a>
            <button (click)="onDelete(event.id)" class="flex-1 btn-danger text-xs">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem vazia -->
      <div *ngIf="(filteredEvents$ | async)?.length === 0" class="card-hover text-center py-12">
        <p class="text-gray-600 text-lg">📭 Nenhum evento encontrado</p>
        <p class="text-gray-500 text-sm mt-2">Clique em "Novo Evento" para começar</p>
      </div>
    </div>
  `,
})
export class EventsComponent implements OnInit {
  // Observables
  summary$: Observable<EventSummary>;
  filteredEvents$: Observable<Event[]>;

  // Form Controls para filtros reativos
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');

  categories: string[] = [];

  constructor(private eventsService: EventsDatabaseService) {
    // Inicializar summary
    this.summary$ = this.eventsService.getEventSummary();

    // Implementar filtros reativos
    this.filteredEvents$ = combineLatest([
      this.eventsService.getEvents(),
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.categoryControl.valueChanges.pipe(startWith('')),
      this.statusControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([events, search, category, status]) => {
        let filtered = events;

        // Filtro de busca
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(e =>
            e.name.toLowerCase().includes(searchLower) ||
            e.location.toLowerCase().includes(searchLower) ||
            (e.responsible && e.responsible.toLowerCase().includes(searchLower))
          );
        }

        // Filtro de categoria
        if (category) {
          filtered = filtered.filter(e => e.category === category);
        }

        // Filtro de status
        if (status) {
          filtered = filtered.filter(e => e.status === status);
        }

        return filtered;
      })
    );
  }

  ngOnInit(): void {
    this.categories = this.eventsService.getCategories();
  }

  async onDelete(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      try {
        await this.eventsService.deleteEvent(id);
        alert('Evento deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
        alert('Erro ao deletar evento. Tente novamente.');
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'badge badge-primary';
      case 'ongoing':
        return 'badge badge-warning';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'scheduled':
        return '📅 Agendado';
      case 'ongoing':
        return '🔴 Em Andamento';
      case 'completed':
        return '✅ Concluído';
      case 'cancelled':
        return '❌ Cancelado';
      default:
        return status;
    }
  }
}
