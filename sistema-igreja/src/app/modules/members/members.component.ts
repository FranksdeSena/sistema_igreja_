import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MembersService } from '../../core/services/members.service';
import { Member } from '../../shared/models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestão de Membros</h1>
          <p class="text-sm text-gray-600 mt-2">Administre os membros da sua igreja</p>
        </div>
        <button routerLink="novo" class="btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>Novo Membro</span>
        </button>
      </div>

      <!-- Barra de Pesquisa -->
      <div class="card">
        <div class="flex gap-4 items-center">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Pesquisar por nome ou telefone..."
            class="input-field flex-1"
          />
          <button (click)="onSearch()" class="btn-primary">🔍 Buscar</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total de Membros</p>
              <p class="text-3xl font-bold text-primary-blue mt-2">{{ members.length }}</p>
            </div>
            <span class="text-5xl opacity-20">👥</span>
          </div>
        </div>
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Membros Ativos</p>
              <p class="text-3xl font-bold text-green-600 mt-2">
                {{ countByStatus('active') }}
              </p>
            </div>
            <span class="text-5xl opacity-20">✅</span>
          </div>
        </div>
        <div class="card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Visitantes</p>
              <p class="text-3xl font-bold text-primary-orange mt-2">
                {{ countByStatus('visiting') }}
              </p>
            </div>
            <span class="text-5xl opacity-20">🤝</span>
          </div>
        </div>
      </div>

      <!-- Tabela de Membros -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-background-gray border-b border-gray-300">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900">WhatsApp</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900">Função</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let member of members" class="hover:bg-background-gray transition-colors">
                <td class="px-6 py-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ member.photo || '👤' }}</span>
                    <div>
                      <p class="font-medium text-gray-900 text-sm">{{ member.name }}</p>
                      <p class="text-xs text-gray-600">{{ formatDate(member.joinDate) }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-2">
                  <a
                    [href]="'https://wa.me/' + cleanPhone(member.whatsapp)"
                    target="_blank"
                    class="text-green-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    <span>💬</span>
                    {{ member.whatsapp }}
                  </a>
                </td>
                <td class="px-6 py-2">
                  <span [ngClass]="getStatusBadgeClass(member.status)" class="badge text-xs">
                    {{ getStatusLabel(member.status) }}
                  </span>
                </td>
                <td class="px-6 py-2">
                  <span class="badge badge-primary text-xs">{{ member.role || 'Membro' }}</span>
                </td>
                <td class="px-6 py-2">
                  <div class="flex gap-1">
                    <button
                      [routerLink]="['editar', member.id]"
                      class="px-3 py-1 bg-primary-blue text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      (click)="onDelete(member.id)"
                      class="px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mensagem vazia -->
          <div *ngIf="members.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">Nenhum membro encontrado</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  searchQuery = '';

  constructor(private membersService: MembersService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.membersService.getMembers().subscribe((members) => {
      this.members = members;
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.membersService.searchMembers(this.searchQuery).subscribe((members) => {
        this.members = members;
      });
    } else {
      this.loadMembers();
    }
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja deletar este membro?')) {
      this.membersService.deleteMember(id).subscribe(() => {
        this.loadMembers();
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Ativo',
      inactive: 'Inativo',
      visiting: 'Visitante',
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'badge-success',
      inactive: 'bg-gray-100 text-gray-800',
      visiting: 'badge-warning',
    };
    return classes[status] || 'badge-primary';
  }

  countByStatus(status: string): number {
    return this.members.filter((m) => m.status === status).length;
  }
}
