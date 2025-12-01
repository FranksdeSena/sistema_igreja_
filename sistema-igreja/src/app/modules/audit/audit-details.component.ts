import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuditService } from '../../core/services/audit.service';
import { AuditLog } from '../../shared/models/audit-log.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-audit-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6" *ngIf="log$ | async as log">
      <!-- Header -->
      <div>
        <button routerLink="/dashboard/auditoria" class="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <span>⬅️</span> Voltar
        </button>
        <h2 class="text-2xl font-bold text-gray-800">Detalhes do Log</h2>
      </div>

      <!-- Informações Principais -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Informações</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-400">Data/Hora</p>
            <p class="font-medium text-gray-900">{{ formatDate(log.timestamp) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Usuário</p>
            <p class="font-medium text-gray-900">{{ log.userName }}</p>
            <p class="text-sm text-gray-500">{{ log.userEmail }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400">Ação</p>
            <span [ngClass]="getActionBadgeClass(log.action)" class="inline-block px-3 py-1 text-sm font-semibold rounded-full mt-1">
              {{ getActionName(log.action) }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-400">Módulo</p>
            <p class="font-medium text-gray-900">{{ getModuleName(log.module) }}</p>
          </div>
          <div *ngIf="log.entityName" class="md:col-span-2">
            <p class="text-xs text-gray-400">Entidade</p>
            <p class="font-medium text-gray-900">{{ log.entityName }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-xs text-gray-400">Descrição</p>
            <p class="font-medium text-gray-900">{{ log.description }}</p>
          </div>
        </div>
      </div>

      <!-- Mudanças (Antes/Depois) -->
      <div *ngIf="log.changes" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Mudanças Realizadas</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Antes -->
          <div *ngIf="log.changes.before">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-red-600 text-xl">❌</span>
              <h4 class="font-semibold text-gray-900">Antes</h4>
            </div>
            <div class="bg-red-50 p-4 rounded-xl border border-red-200">
              <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ formatJSON(log.changes.before) }}</pre>
            </div>
          </div>

          <!-- Depois -->
          <div *ngIf="log.changes.after">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-green-600 text-xl">✅</span>
              <h4 class="font-semibold text-gray-900">Depois</h4>
            </div>
            <div class="bg-green-50 p-4 rounded-xl border border-green-200">
              <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ formatJSON(log.changes.after) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- IP Address (se disponível) -->
      <div *ngIf="log.ipAddress" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Informações Técnicas</h3>
        <div>
          <p class="text-xs text-gray-400">Endereço IP</p>
          <p class="font-medium text-gray-900">{{ log.ipAddress }}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuditDetailsComponent implements OnInit {
  log$!: Observable<AuditLog | undefined>;
  logId: string = '';

  constructor(
    private route: ActivatedRoute,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('id') || '';
    // Como não temos método getById, vamos buscar todos e filtrar
    this.log$ = this.auditService.getLogs({}, 500).pipe(
      map(logs => logs.find(log => log.id === this.logId))
    );
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
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
}
