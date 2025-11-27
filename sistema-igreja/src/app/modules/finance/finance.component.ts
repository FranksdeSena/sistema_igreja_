import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceDatabaseService } from '../../core/services/finance-database.service';
import { Transaction, FinancialSummary } from '../../shared/models';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <!-- Total Receitas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Receitas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-green-600 break-words">
              R$ {{ (summary$ | async)?.totalIncome | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💰</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Tempo real</p>
        </div>

        <!-- Total Despesas -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Total Despesas</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-red-600 break-words">
              R$ {{ (summary$ | async)?.totalExpense | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💸</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Tempo real</p>
        </div>

        <!-- Saldo -->
        <div
          class="card-hover p-4 md:p-5"
          [ngClass]="((summary$ | async)?.balance || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'"
        >
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Saldo</p>
          <div class="flex items-end justify-between gap-3">
            <p
              class="text-lg md:text-xl font-bold break-words"
              [ngClass]="((summary$ | async)?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              R$ {{ (summary$ | async)?.balance | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📊</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Tempo real</p>
        </div>

        <!-- Pendentes -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Pendentes</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-yellow-600 break-words">
              R$ {{ (summary$ | async)?.pendingAmount | number : '1.2-2' }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">⏳</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Tempo real</p>
        </div>

        <!-- Total Transações -->
        <div class="card-hover p-4 md:p-5">
          <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Transações</p>
          <div class="flex items-end justify-between gap-3">
            <p class="text-lg md:text-xl font-bold text-primary-blue">
              {{ (summary$ | async)?.transactionCount }}
            </p>
            <span class="flex-shrink-0 text-lg md:text-xl opacity-20">📝</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">Tempo real</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            [formControl]="searchControl"
            placeholder="Pesquisar por descrição ou categoria..."
            class="input-field"
          />
          <select [formControl]="typeControl" class="input-field">
            <option value="">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select [formControl]="categoryControl" class="input-field">
            <option value="">Todas as Categorias</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
          <select [formControl]="statusControl" class="input-field">
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
              *ngFor="let transaction of filteredTransactions$ | async"
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
        <div *ngFor="let transaction of filteredTransactions$ | async" class="card-hover">
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
      <div *ngIf="(filteredTransactions$ | async)?.length === 0" class="card-hover text-center py-12">
        <p class="text-gray-600 text-lg">📭 Nenhuma transação encontrada</p>
        <p class="text-gray-500 text-sm mt-2">Clique em "Nova Transação" para começar</p>
      </div>
    </div>
  `,
})
export class FinanceComponent implements OnInit {
  filteredTransactions$: Observable<Transaction[]>;
  summary$: Observable<FinancialSummary>;
  
  searchControl = new FormControl('');
  typeControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');
  
  categories: string[] = [];

  constructor(private financeService: FinanceDatabaseService) {
    // Combinar filtros reativos
    this.filteredTransactions$ = combineLatest([
      this.financeService.getTransactions(),
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.typeControl.valueChanges.pipe(startWith('')),
      this.categoryControl.valueChanges.pipe(startWith('')),
      this.statusControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([transactions, search, type, category, status]) => {
        return transactions.filter(t => {
          const matchesSearch = !search || 
            t.description.toLowerCase().includes(search.toLowerCase()) ||
            t.category.toLowerCase().includes(search.toLowerCase());
          
          const matchesType = !type || t.type === type;
          const matchesCategory = !category || t.category === category;
          const matchesStatus = !status || t.status === status;
          
          return matchesSearch && matchesType && matchesCategory && matchesStatus;
        });
      })
    );

    // Resumo financeiro em tempo real
    this.summary$ = this.financeService.getFinancialSummary();
  }

  ngOnInit(): void {
    this.categories = this.financeService.getCategories();
  }

  async onDelete(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await this.financeService.deleteTransaction(id);
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
        alert('Erro ao deletar transação. Tente novamente.');
      }
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
