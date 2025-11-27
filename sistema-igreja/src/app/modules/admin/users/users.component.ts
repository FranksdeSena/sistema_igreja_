import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserProfile } from '../../../core/services/user-management.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Gestão de Usuários</h2>
          <p class="text-gray-500">Administre o acesso e permissões do sistema</p>
        </div>
        <button routerLink="novo" class="btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>Novo Usuário</span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Busca por nome/email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Nome ou email..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          <!-- Filtro por Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Função</label>
            <select
              [(ngModel)]="roleFilter"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="">Todas</option>
              <option value="admin">Administrador</option>
              <option value="pastor">Pastor</option>
              <option value="secretaria">Secretaria</option>
              <option value="member">Membro</option>
            </select>
          </div>

          <!-- Filtro por Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              [(ngModel)]="statusFilter"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        <!-- Contador de resultados -->
        <div class="mt-3 text-sm text-gray-600">
          Mostrando <strong>{{ (filteredUsers$ | async)?.length || 0 }}</strong> usuário(s)
        </div>
      </div>

      <!-- Lista de Usuários -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Função</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let user of filteredUsers$ | async" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold">
                      {{ user.full_name.charAt(0) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                      <div class="text-xs text-gray-500">Criado em {{ user.created_at | date:'dd/MM/yyyy' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-red-100 text-red-800': user.role === 'admin',
                      'bg-blue-100 text-blue-800': user.role === 'pastor',
                      'bg-purple-100 text-purple-800': user.role === 'secretaria',
                      'bg-gray-100 text-gray-800': user.role === 'member'
                    }">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                    {{ user.is_active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button
                      [routerLink]="['editar', user.uid]"
                      class="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Editar Permissões"
                    >
                      ✏️
                    </button>
                    <button
                      (click)="onDelete(user.uid)"
                      class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Excluir Acesso"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UsersComponent implements OnInit {
  users$: Observable<UserProfile[]>;
  filteredUsers$: Observable<UserProfile[]>;
  
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  
  private searchTermSubject = new BehaviorSubject<string>('');
  private roleFilterSubject = new BehaviorSubject<string>('');
  private statusFilterSubject = new BehaviorSubject<string>('');

  constructor(private userService: UserManagementService) {
    this.users$ = this.userService.getUsers();
    
    // Combinar filtros
    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchTermSubject,
      this.roleFilterSubject,
      this.statusFilterSubject
    ]).pipe(
      map(([users, search, role, status]) => {
        return users.filter(user => {
          // Filtro de busca
          const matchesSearch = !search || 
            user.full_name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
          
          // Filtro de role
          const matchesRole = !role || user.role === role;
          
          // Filtro de status
          const matchesStatus = !status || user.is_active.toString() === status;
          
          return matchesSearch && matchesRole && matchesStatus;
        });
      })
    );
  }

  ngOnInit(): void {
    // Debug: verificar se os usuários estão sendo carregados
    this.users$.subscribe({
      next: (users) => {
        console.log('Usuários carregados:', users);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }

  applyFilters(): void {
    this.searchTermSubject.next(this.searchTerm);
    this.roleFilterSubject.next(this.roleFilter);
    this.statusFilterSubject.next(this.statusFilter);
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      pastor: 'Pastor',
      secretaria: 'Secretaria',
      member: 'Membro'
    };
    return labels[role] || role;
  }

  onDelete(uid: string): void {
    if (confirm('Tem certeza que deseja remover o acesso deste usuário?')) {
      this.userService.deleteUser(uid).then(() => {
        console.log('Usuário removido com sucesso');
      }).catch(err => {
        console.error('Erro ao remover usuário:', err);
        alert('Erro ao remover usuário: ' + err.message);
      });
    }
  }
}
