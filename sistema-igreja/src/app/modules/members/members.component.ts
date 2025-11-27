import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';
import { Member } from '../../shared/models';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Membros</h2>
          <p class="text-gray-500">Gerencie os membros da igreja</p>
        </div>
        <button *ngIf="isAdmin()" routerLink="novo" class="btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>Novo Membro</span>
        </button>
      </div>

      <!-- Filtros e Busca -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              [formControl]="searchControl"
              placeholder="Buscar por nome, email ou telefone..."
              class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <select 
            [formControl]="statusControl"
            class="px-4 py-2 rounded-xl border border-gray-200 focus:border-primary-blue outline-none bg-white">
            <option value="">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <!-- Lista de Membros -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membro</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contato</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Papel</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" *ngIf="isAdmin()">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let member of filteredMembers$ | async" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                      {{ member.photo || '👤' }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                      <div class="text-xs text-gray-500">Desde {{ member.joinDate | date:'MM/yyyy' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.email }}</div>
                  <a 
                    *ngIf="member.whatsapp" 
                    [href]="getWhatsAppLink(member.whatsapp)" 
                    target="_blank"
                    class="text-sm text-green-600 hover:text-green-800 flex items-center gap-1 mt-1"
                    title="Abrir conversa no WhatsApp"
                  >
                    <span>📱</span>
                    <span>{{ member.whatsapp }}</span>
                  </a>
                  <div *ngIf="!member.whatsapp" class="text-sm text-gray-500">{{ member.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-800': member.status === 'active',
                      'bg-red-100 text-red-800': member.status === 'inactive'
                    }">
                    {{ member.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ member.role }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" *ngIf="isAdmin()">
                  <div class="flex gap-2">
                    <button
                      [routerLink]="['editar', member.id]"
                      class="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      (click)="deleteMember(member.id)"
                      class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="(filteredMembers$ | async)?.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  Nenhum membro encontrado.
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
export class MembersComponent implements OnInit {
  filteredMembers$: Observable<Member[]>;
  searchControl = new FormControl('');
  statusControl = new FormControl('');
  currentUserRole: string | null = null;

  constructor(
    private membersService: MembersDatabaseService,
    private authService: FirebaseAuthService
  ) {
    // Combina os filtros com a lista de membros
    this.filteredMembers$ = combineLatest([
      this.membersService.getMembers(),
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300)),
      this.statusControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([members, searchTerm, statusFilter]) => {
        return members.filter(member => {
          const matchesSearch = !searchTerm || 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone?.includes(searchTerm);
            
          const matchesStatus = !statusFilter || member.status === statusFilter;
          
          return matchesSearch && matchesStatus;
        });
      })
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserRole = user?.role || null;
    });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  getWhatsAppLink(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  }

  deleteMember(id: string): void {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      this.membersService.deleteMember(id).then(() => {
        // Feedback visual se necessário
      }).catch(error => {
        console.error('Erro ao excluir membro:', error);
        alert('Erro ao excluir membro. Tente novamente.');
      });
    }
  }
}
