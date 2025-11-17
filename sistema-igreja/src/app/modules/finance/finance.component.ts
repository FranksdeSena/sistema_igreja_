import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../../core/services/finance.service';
import { Transaction, FinancialSummary } from '../../shared/models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p class="text-xs md:text-sm text-gray-600 mt-1">Administre receitas e despesas</p>
        </div>
        <button
          routerLink="novo"
          class="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <span class="text-lg">➕</span>
          <span class="hidden md:inline">Nova Transação</span>
          <span class="md:hidden">Novo</span>
        </button>
      </div>

      <!-- Barra de Pesquisa -->
      <div class="card">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Pesquisar por descrição, categoria ou beneficiário..."
            class="input-field flex-1 w-full md:w-auto"
          />
          <button (click)="onSearch()" class="btn-primary">🔍 Buscar</button>
          <button (click)="clearSearch()" class="btn-secondary">Limpar</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- Total Receitas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Receitas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-green-600 break-words">
              R$ {{ summary.totalIncome | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💰</span>
          </div>
        </div>

        <!-- Total Despesas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Despesas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-red-600 break-words">
              R$ {{ summary.totalExpense | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💸</span>
          </div>
        </div>

        <!-- Saldo -->
        <div
          class="card-hover p-4 md:p-5"
          [ngClass]="summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'"
        >
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Saldo</p>
          <div class="flex items-end justify-between gap-3">
            <p
              class="text-lg md:text-xl font-bold break-words"
              [ngClass]="summary.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              R$ {{ summary.balance | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📊</span>
          </div>
        </div>

        <!-- Pendentes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Pendentes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-yellow-600 break-words">
              R$ {{ summary.pendingAmount | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⏳</span>
          </div>
        </div>

        <!-- Total Transações -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Transações</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue">
              {{ summary.transactionCount }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📝</span>
          </div>
        </div>
      </div>
      <!-- Filtros -->
      <div class="card">
        <div class="flex flex-col md:flex-row gap-4">
          <select [(ngModel)]="selectedType" (change)="onTypeChange()" class="input-field flex-1">
            <option value="">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select
            [(ngModel)]="selectedCategory"
            (change)="onCategoryChange()"
            class="input-field flex-1"
          >
            <option value="">Todas as Categorias</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
          <select
            [(ngModel)]="selectedStatus"
            (change)="onStatusChange()"
            class="input-field flex-1"
          >
            <option value="">Todos os Status</option>
            <option value="completed">Concluído</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <!-- Tabela de Transações (Desktop) -->
      <div class="hidden md:block card-hover overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let transaction of filteredTransactions"
              class="border-t hover:bg-gray-50 transition"
            >
              <td class="px-4 py-3 text-sm text-gray-800">
                {{ transaction.date | date : 'dd/MM/yyyy' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-800">{{ transaction.description }}</td>
              <td class="px-4 py-3 text-sm">
                <span class="badge">{{ transaction.category }}</span>
              </td>
              <td
                class="px-4 py-3 text-sm font-semibold"
                [ngClass]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }} R$
                {{ transaction.amount | number : '1.2-2' }}
              </td>
              <td class="px-4 py-3 text-sm">
                <span [ngClass]="getTypeBadgeClass(transaction.type)">
                  {{ transaction.type === 'income' ? '📥 Receita' : '📤 Despesa' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span [ngClass]="getStatusBadgeClass(transaction.status)">
                  {{ getStatusLabel(transaction.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex gap-2 justify-center">
                  <a
                    [routerLink]="['editar', transaction.id]"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ✏️ Editar
                  </a>
                  <button
                    (click)="onDelete(transaction.id)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards de Transações (Mobile) -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let transaction of filteredTransactions" class="card-hover">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ transaction.description }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ transaction.date | date : 'dd/MM/yyyy' }}</p>
            </div>
            <span
              class="text-lg font-bold"
              [ngClass]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }} R$
              {{ transaction.amount | number : '1.2-2' }}
            </span>
          </div>
          <div class="flex gap-2 mb-3">
            <span class="badge text-xs">{{ transaction.category }}</span>
            <span [ngClass]="getStatusBadgeClass(transaction.status)" class="text-xs">
              {{ getStatusLabel(transaction.status) }}
            </span>
          </div>
          <div class="flex gap-2">
            <a
              [routerLink]="['editar', transaction.id]"
              class="flex-1 btn-primary text-xs text-center"
            >
              ✏️ Editar
            </a>
            <button (click)="onDelete(transaction.id)" class="flex-1 btn-danger text-xs">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>

      <!-- Mensagem vazia -->
      <div *ngIf="filteredTransactions.length === 0" class="card-hover text-center py-12">
        <p class="text-gray-600 text-lg">📭 Nenhuma transação encontrada</p>
        <p class="text-gray-500 text-sm mt-2">Clique em "Nova Transação" para começar</p>
      </div>
    </div>
  `,
})
export class FinanceComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  summary: FinancialSummary = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
    pendingAmount: 0,
  };

  searchQuery = '';
  selectedType = '';
  selectedCategory = '';
  selectedStatus = '';
  categories: string[] = [];

  constructor(private financeService: FinanceService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
    this.categories = this.financeService.getCategories();
  }

  loadTransactions(): void {
    this.financeService.getTransactions().subscribe((transactions) => {
      this.transactions = transactions;
      this.applyFilters();
    });
  }

  loadSummary(): void {
    this.financeService.getFinancialSummary().subscribe((summary) => {
      this.summary = summary;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.transactions;

    if (this.searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter((t) => t.type === this.selectedType);
    }

    if (this.selectedCategory) {
      filtered = filtered.filter((t) => t.category === this.selectedCategory);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((t) => t.status === this.selectedStatus);
    }

    this.filteredTransactions = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      this.financeService.deleteTransaction(id);
      this.loadTransactions();
      this.loadSummary();
    }
  }

  getTypeBadgeClass(type: string): string {
    return type === 'income' ? 'badge badge-success' : 'badge badge-danger';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'cancelled':
        return 'badge badge-danger';
      default:
        return 'badge';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return '✅ Concluído';
      case 'pending':
        return '⏳ Pendente';
      case 'cancelled':
        return '❌ Cancelado';
      default:
        return status;
    }
  }
}
