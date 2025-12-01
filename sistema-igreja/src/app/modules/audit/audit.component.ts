import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { AuditLog } from '../../shared/models/audit-log.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Auditoria do Sistema</h2>
            <p class="text-gray-500">Registro de todas as ações realizadas no sistema</p>
          </div>
          <button (click)="exportLogs()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
            <span>📥</span>
            <span>Exportar CSV</span>
          </button>
        </div>

        <!-- Filtros -->
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
            <select formControlName="module" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white">
              <option value="">Todos</option>
              <option *ngFor="let mod of modules" [value]="mod">{{ getModuleName(mod) }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ação</label>
            <select formControlName="action" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white">
              <option value="">Todas</option>
              <option *ngFor="let act of actions" [value]="act">{{ getActionName(act) }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input formControlName="startDate" type="date" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input formControlName="endDate" type="date" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none">
          </div>
        </form>
      </div>

      <!-- Lista de Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let log of filteredLogs$ | async" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(log.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ log.userName }}</div>
                  <div class="text-sm text-gray-500">{{ log.userEmail }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [ngClass]="getActionBadgeClass(log.action)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getActionName(log.action) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getModuleName(log.module) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div class="max-w-xs truncate">{{ log.description }}</div>
                  <div *ngIf="log.entityName" class="text-xs text-gray-500 mt-1">{{ log.entityName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button [routerLink]="[log.id]" class="text-blue-600 hover:text-blue-800 font-medium">
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div *ngIf="(filteredLogs$ | async)?.length === 0" class="text-center py-12">
            <div class="text-4xl mb-2">📋</div>
            <p class="text-gray-500">Nenhum log encontrado</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuditComponent implements OnInit {
  logs$: Observable<AuditLog[]>;
  filteredLogs$: Observable<AuditLog[]>;
  filterForm: FormGroup;
  modules: string[] = [];
  actions: string[] = [];

  constructor(
    private auditService: AuditService
  ) {
    this.modules = this.auditService.getModules();
    this.actions = this.auditService.getActions();

    this.filterForm = new FormGroup({
      module: new FormControl(''),
      action: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl('')
    });

    this.logs$ = this.auditService.getLogs({}, 200);

    // Aplicar filtros reativos
    this.filteredLogs$ = combineLatest([
      this.logs$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([logs, filters]) => {
        return logs.filter(log => {
          if (filters.module && log.module !== filters.module) return false;
          if (filters.action && log.action !== filters.action) return false;
          if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
          if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate + 'T23:59:59')) return false;
          return true;
        });
      })
    );
  }

  ngOnInit(): void {}

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString('pt-BR');
  }

  getModuleName(module: string): string {
    const names: { [key: string]: string } = {
      'members': 'Membros',
      'finance': 'Financeiro',
      'events': 'Eventos',
      'cells': 'Células',
      'ministries': 'Ministérios',
      'users': 'Usuários',
      'auth': 'Autenticação'
    };
    return names[module] || module;
  }

  getActionName(action: string): string {
    const names: { [key: string]: string } = {
      'CREATE': 'Criar',
      'UPDATE': 'Editar',
      'DELETE': 'Excluir',
      'LOGIN': 'Login',
      'LOGOUT': 'Logout'
    };
    return names[action] || action;
  }

  getActionBadgeClass(action: string): string {
    const classes: { [key: string]: string } = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'LOGIN': 'bg-purple-100 text-purple-800',
      'LOGOUT': 'bg-gray-100 text-gray-800'
    };
    return classes[action] || 'bg-gray-100 text-gray-800';
  }

  async exportLogs() {
    const logs = await this.filteredLogs$.toPromise();
    if (logs && logs.length > 0) {
      const filename = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      this.auditService.downloadCSV(logs, filename);
    } else {
      alert('Nenhum log para exportar');
    }
  }
}
