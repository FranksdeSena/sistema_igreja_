import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PastorService } from '../../core/services/pastor.service';
import { Sermon, PastoralVisit, PastoralSummary } from '../../shared/models';

@Component({
  selector: 'app-pastor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Gestão Pastoral</h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">
            Acompanhe pregações e visitas pastorais
          </p>
        </div>
        <button
          routerLink="novo-sermao"
          class="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <span class="text-lg">➕</span>
          <span class="hidden md:inline">Novo Sermão</span>
          <span class="md:hidden">Novo</span>
        </button>
      </div>

      <!-- Abas de Navegação -->
      <div class="card">
        <div class="flex gap-2">
          <button
            (click)="switchTab('sermons')"
            [class.bg-primary-blue]="currentTab === 'sermons'"
            [class.text-white]="currentTab === 'sermons'"
            [class.bg-gray-100]="currentTab !== 'sermons'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            📖 Sermões
          </button>
          <button
            (click)="switchTab('visits')"
            [class.bg-primary-blue]="currentTab === 'visits'"
            [class.text-white]="currentTab === 'visits'"
            [class.bg-gray-100]="currentTab !== 'visits'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🤝 Visitas Pastorais
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- Total Sermões -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Sermões</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ summary.totalSermons }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📖</span>
          </div>
        </div>

        <!-- Total Visitas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Visitas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-blue-600 break-words">
              {{ summary.totalVisits }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">🤝</span>
          </div>
        </div>

        <!-- Visitas Concluídas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Concluídas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-green-600 break-words">
              {{ summary.completedVisits }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">✅</span>
          </div>
        </div>

        <!-- Visitas Pendentes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Pendentes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-yellow-600 break-words">
              {{ summary.pendingVisits }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⏳</span>
          </div>
        </div>

        <!-- Total Participantes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Participantes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue break-words">
              {{ summary.totalAttendance }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">👥</span>
          </div>
        </div>
      </div>

      <!-- TAB: SERMÕES -->
      <ng-container *ngIf="currentTab === 'sermons'">
        <!-- Barra de Pesquisa -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              [(ngModel)]="searchQuerySermons"
              (input)="onSearchSermons()"
              placeholder="Pesquisar por título, pastor ou texto bíblico..."
              class="input-field flex-1 w-full md:w-auto"
            />
            <button (click)="onSearchSermons()" class="btn-primary">🔍 Buscar</button>
            <button (click)="clearSearchSermons()" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4">
            <select
              [(ngModel)]="selectedCategory"
              (change)="onCategoryChange()"
              class="input-field flex-1"
            >
              <option value="">Todas as Categorias</option>
              <option *ngFor="let cat of sermonCategories" [value]="cat">{{ cat }}</option>
            </select>
            <select
              [(ngModel)]="selectedSermonStatus"
              (change)="onSermonStatusChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Status</option>
              <option value="scheduled">📅 Agendado</option>
              <option value="completed">✅ Concluído</option>
              <option value="cancelled">❌ Cancelado</option>
            </select>
          </div>
        </div>

        <!-- Tabela Sermões (Desktop) -->
        <div class="hidden md:block card-hover overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pastor</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Texto</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duração</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Participantes
                </th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sermon of filteredSermons" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900">
                  {{ sermon.date | date : 'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                  {{ sermon.title }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ sermon.pastor }}</td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  {{ sermon.biblicalText }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ sermon.duration }}min</td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900">{{ sermon.attendance }}</td>
                <td class="px-4 py-3 text-xs md:text-sm">
                  <span [ngClass]="getSermonStatusBadgeClass(sermon.status)">
                    {{ getSermonStatusLabel(sermon.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex gap-2 justify-center">
                    <a
                      [routerLink]="['editar-sermao', sermon.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                    >
                      ✏️
                    </a>
                    <button
                      (click)="onDeleteSermon(sermon.id)"
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

        <!-- Cards Sermões (Mobile) -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let sermon of filteredSermons" class="card-hover">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ sermon.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ sermon.date | date : 'dd/MM/yyyy' }}</p>
              </div>
              <span [ngClass]="getSermonStatusBadgeClass(sermon.status)" class="text-xs">
                {{ getSermonStatusLabel(sermon.status) }}
              </span>
            </div>
            <div class="flex gap-2 mb-3 flex-wrap">
              <span class="badge text-xs">{{ sermon.topicCategory }}</span>
              <span class="text-xs text-gray-600">👤 {{ sermon.pastor }}</span>
            </div>
            <div class="mb-3 text-xs text-gray-700">
              📖 {{ sermon.biblicalText }} | ⏱️ {{ sermon.duration }}min | 👥
              {{ sermon.attendance }}
            </div>
            <div class="flex gap-2">
              <a
                [routerLink]="['editar-sermao', sermon.id]"
                class="flex-1 btn-primary text-xs text-center"
              >
                ✏️ Editar
              </a>
              <button (click)="onDeleteSermon(sermon.id)" class="flex-1 btn-danger text-xs">
                🗑️ Deletar
              </button>
            </div>
          </div>
        </div>

        <!-- Mensagem vazia -->
        <div *ngIf="filteredSermons.length === 0" class="card-hover text-center py-12">
          <p class="text-gray-600 text-lg">📭 Nenhum sermão encontrado</p>
          <p class="text-gray-500 text-sm mt-2">Clique em "Novo Sermão" para começar</p>
        </div>
      </ng-container>

      <!-- TAB: VISITAS PASTORAIS -->
      <ng-container *ngIf="currentTab === 'visits'">
        <!-- Barra de Pesquisa -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              [(ngModel)]="searchQueryVisits"
              (input)="onSearchVisits()"
              placeholder="Pesquisar por membro, pastor ou assunto..."
              class="input-field flex-1 w-full md:w-auto"
            />
            <button (click)="onSearchVisits()" class="btn-primary">🔍 Buscar</button>
            <button (click)="clearSearchVisits()" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <!-- Botão Novo -->
        <div class="flex justify-end">
          <button routerLink="nova-visita" class="btn-primary flex items-center gap-2 text-sm">
            <span class="text-lg">➕</span>
            <span>Nova Visita</span>
          </button>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="flex flex-col md:flex-row gap-4">
            <select
              [(ngModel)]="selectedVisitType"
              (change)="onVisitTypeChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Tipos</option>
              <option *ngFor="let type of visitTypes" [value]="type">{{ type }}</option>
            </select>
            <select
              [(ngModel)]="selectedVisitStatus"
              (change)="onVisitStatusChange()"
              class="input-field flex-1"
            >
              <option value="">Todos os Status</option>
              <option value="scheduled">📅 Agendada</option>
              <option value="completed">✅ Concluída</option>
              <option value="cancelled">❌ Cancelada</option>
            </select>
          </div>
        </div>

        <!-- Tabela Visitas (Desktop) -->
        <div class="hidden md:block card-hover overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Membro</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pastor</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assunto</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let visit of filteredVisits" class="border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900">
                  {{ visit.date | date : 'dd/MM/yyyy' }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-900 font-medium">
                  {{ visit.memberName }}
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ visit.pastor }}</td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">
                  <span class="badge">{{ visit.visitType }}</span>
                </td>
                <td class="px-4 py-3 text-xs md:text-sm text-gray-700">{{ visit.subject }}</td>
                <td class="px-4 py-3 text-xs md:text-sm">
                  <span [ngClass]="getVisitStatusBadgeClass(visit.status)">
                    {{ getVisitStatusLabel(visit.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex gap-2 justify-center">
                    <a
                      [routerLink]="['editar-visita', visit.id]"
                      class="text-primary-blue hover:text-blue-700 text-sm"
                    >
                      ✏️
                    </a>
                    <button
                      (click)="onDeleteVisit(visit.id)"
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

        <!-- Cards Visitas (Mobile) -->
        <div class="md:hidden space-y-4">
          <div *ngFor="let visit of filteredVisits" class="card-hover">
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ visit.memberName }}</p>
                <p class="text-xs text-gray-600 mt-1">
                  {{ visit.date | date : 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <span [ngClass]="getVisitStatusBadgeClass(visit.status)" class="text-xs">
                {{ getVisitStatusLabel(visit.status) }}
              </span>
            </div>
            <div class="flex gap-2 mb-3 flex-wrap">
              <span class="badge text-xs">{{ visit.visitType }}</span>
              <span class="text-xs text-gray-600">👤 {{ visit.pastor }}</span>
            </div>
            <div class="mb-3 text-xs text-gray-700">{{ visit.subject }}</div>
            <div class="flex gap-2">
              <a
                [routerLink]="['editar-visita', visit.id]"
                class="flex-1 btn-primary text-xs text-center"
              >
                ✏️ Editar
              </a>
              <button (click)="onDeleteVisit(visit.id)" class="flex-1 btn-danger text-xs">
                🗑️ Deletar
              </button>
            </div>
          </div>
        </div>

        <!-- Mensagem vazia -->
        <div *ngIf="filteredVisits.length === 0" class="card-hover text-center py-12">
          <p class="text-gray-600 text-lg">📭 Nenhuma visita encontrada</p>
          <p class="text-gray-500 text-sm mt-2">Clique em "Nova Visita" para começar</p>
        </div>
      </ng-container>
    </div>
  `,
})
export class PastorComponent implements OnInit {
  currentTab: 'sermons' | 'visits' = 'sermons';

  // Sermões
  sermons: Sermon[] = [];
  filteredSermons: Sermon[] = [];
  searchQuerySermons = '';
  selectedCategory = '';
  selectedSermonStatus = '';
  sermonCategories: string[] = [];

  // Visitas
  visits: PastoralVisit[] = [];
  filteredVisits: PastoralVisit[] = [];
  searchQueryVisits = '';
  selectedVisitType = '';
  selectedVisitStatus = '';
  visitTypes: string[] = [];

  summary: PastoralSummary = {
    totalSermons: 0,
    totalVisits: 0,
    completedVisits: 0,
    pendingVisits: 0,
    totalAttendance: 0,
    averageDuration: 0,
  };

  constructor(private pastorService: PastorService) {}

  ngOnInit(): void {
    this.sermonCategories = this.pastorService.getSermonCategories();
    this.visitTypes = this.pastorService.getVisitTypes();
    this.loadSermons();
    this.loadVisits();
    this.loadSummary();
  }

  switchTab(tab: 'sermons' | 'visits'): void {
    this.currentTab = tab;
  }

  // ========== SERMÕES ==========

  loadSermons(): void {
    this.pastorService.getSermons().subscribe((sermons) => {
      this.sermons = sermons;
      this.applySermonFilters();
    });
  }

  onSearchSermons(): void {
    this.applySermonFilters();
  }

  clearSearchSermons(): void {
    this.searchQuerySermons = '';
    this.selectedCategory = '';
    this.selectedSermonStatus = '';
    this.applySermonFilters();
  }

  onCategoryChange(): void {
    this.applySermonFilters();
  }

  onSermonStatusChange(): void {
    this.applySermonFilters();
  }

  applySermonFilters(): void {
    let filtered = this.sermons;

    if (this.searchQuerySermons) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(this.searchQuerySermons.toLowerCase()) ||
          s.pastor.toLowerCase().includes(this.searchQuerySermons.toLowerCase())
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((s) => s.topicCategory === this.selectedCategory);
    }

    if (this.selectedSermonStatus) {
      filtered = filtered.filter((s) => s.status === this.selectedSermonStatus);
    }

    this.filteredSermons = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onDeleteSermon(id: string): void {
    if (confirm('Tem certeza que deseja deletar este sermão?')) {
      this.pastorService.deleteSermon(id);
      this.loadSermons();
      this.loadSummary();
    }
  }

  // ========== VISITAS ==========

  loadVisits(): void {
    this.pastorService.getVisits().subscribe((visits) => {
      this.visits = visits;
      this.applyVisitFilters();
    });
  }

  onSearchVisits(): void {
    this.applyVisitFilters();
  }

  clearSearchVisits(): void {
    this.searchQueryVisits = '';
    this.selectedVisitType = '';
    this.selectedVisitStatus = '';
    this.applyVisitFilters();
  }

  onVisitTypeChange(): void {
    this.applyVisitFilters();
  }

  onVisitStatusChange(): void {
    this.applyVisitFilters();
  }

  applyVisitFilters(): void {
    let filtered = this.visits;

    if (this.searchQueryVisits) {
      filtered = filtered.filter(
        (v) =>
          v.memberName.toLowerCase().includes(this.searchQueryVisits.toLowerCase()) ||
          v.pastor.toLowerCase().includes(this.searchQueryVisits.toLowerCase())
      );
    }

    if (this.selectedVisitType) {
      filtered = filtered.filter((v) => v.visitType === this.selectedVisitType);
    }

    if (this.selectedVisitStatus) {
      filtered = filtered.filter((v) => v.status === this.selectedVisitStatus);
    }

    this.filteredVisits = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onDeleteVisit(id: string): void {
    if (confirm('Tem certeza que deseja deletar esta visita?')) {
      this.pastorService.deleteVisit(id);
      this.loadVisits();
      this.loadSummary();
    }
  }

  // ========== SUMMARY ==========

  loadSummary(): void {
    this.pastorService.getPastoralSummary().subscribe((summary) => {
      this.summary = summary;
    });
  }

  // ========== BADGE CLASSES ==========

  getSermonStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'badge badge-primary';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  }

  getSermonStatusLabel(status: string): string {
    switch (status) {
      case 'scheduled':
        return '📅 Agendado';
      case 'completed':
        return '✅ Concluído';
      case 'cancelled':
        return '❌ Cancelado';
      default:
        return status;
    }
  }

  getVisitStatusBadgeClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'badge badge-primary';
      case 'completed':
        return 'badge badge-success';
      case 'cancelled':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  }

  getVisitStatusLabel(status: string): string {
    switch (status) {
      case 'scheduled':
        return '📅 Agendada';
      case 'completed':
        return '✅ Concluída';
      case 'cancelled':
        return '❌ Cancelada';
      default:
        return status;
    }
  }
}
