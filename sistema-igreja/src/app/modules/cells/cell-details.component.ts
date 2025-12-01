import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CellsDatabaseService } from '../../core/services/cells-database.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Cell } from '../../shared/models/cell.model';
import { Member } from '../../shared/models/member.model';
import { Observable, combineLatest, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cell-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6" *ngIf="cell$ | async as cell">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button routerLink="/dashboard/celulas" class="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-2">
            <span>⬅️</span> Voltar
          </button>
          <h2 class="text-2xl font-bold text-gray-800">{{ cell.name }}</h2>
          <p class="text-gray-500">{{ cell.description || 'Sem descrição' }}</p>
        </div>
        <div class="flex gap-2">
          <button [routerLink]="['/dashboard/celulas/editar', cell.id]" class="btn-secondary flex items-center gap-2">
            <span>✏️</span>
            <span>Editar Célula</span>
          </button>
        </div>
      </div>

      <!-- Informações da Célula -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👤</span>
            <div>
              <p class="text-xs text-gray-400">Líder</p>
              <p class="font-medium">{{ cell.leaderName }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏠</span>
            <div>
              <p class="text-xs text-gray-400">Anfitrião</p>
              <p class="font-medium">{{ cell.host || 'Não definido' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <div>
              <p class="text-xs text-gray-400">Encontro</p>
              <p class="font-medium">{{ cell.meetingDay }} às {{ cell.meetingTime }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">📍</span>
            <div>
              <p class="text-xs text-gray-400">Local</p>
              <p class="font-medium">{{ cell.address }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Membros da Célula -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Membros ({{ (cellMembers$ | async)?.length || 0 }})
          </h3>
          <button (click)="showAddMemberModal = true" class="btn-primary flex items-center gap-2">
            <span>➕</span>
            <span>Adicionar Membro</span>
          </button>
        </div>

        <!-- Lista de Membros -->
        <div class="space-y-3" *ngIf="(cellMembers$ | async)?.length! > 0; else noMembers">
          <div *ngFor="let member of cellMembers$ | async" class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl shadow-md">
                {{ member.photo || '👤' }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ member.name }}</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span>📍</span>
                  <span>{{ member.address || 'Endereço não cadastrado' }}</span>
                </p>
                <a *ngIf="member.whatsapp" [href]="getWhatsAppLink(member.whatsapp)" target="_blank" class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-1 hover:underline">
                  <span>💬</span>
                  <span>{{ member.whatsapp }}</span>
                </a>
              </div>
            </div>
            <div class="flex gap-2">
              <button [routerLink]="['/dashboard/membros/editar', member.id]" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1" title="Editar membro">
                <span>✏️</span>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button (click)="removeMember(member.id)" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1" title="Remover da célula">
                <span>🗑️</span>
                <span class="hidden sm:inline">Remover</span>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noMembers>
          <div class="text-center py-8 text-gray-400">
            <p class="text-4xl mb-2">👥</p>
            <p>Nenhum membro adicionado ainda</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal Adicionar Membro -->
      <div *ngIf="showAddMemberModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="showAddMemberModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">Adicionar Membro</h3>
            <button (click)="showAddMemberModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div class="space-y-2">
            <div *ngFor="let member of availableMembers$ | async" class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                  {{ member.photo || '👤' }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ member.name }}</p>
                  <p class="text-sm text-gray-500">{{ member.phone }}</p>
                </div>
              </div>
              <button (click)="addMember(member.id)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Adicionar
              </button>
            </div>

            <div *ngIf="(availableMembers$ | async)?.length === 0" class="text-center py-8 text-gray-400">
              <p>Todos os membros já estão nesta célula</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      @apply bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200;
    }
    .btn-secondary {
      @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors font-medium;
    }
  `]
})
export class CellDetailsComponent implements OnInit {
  cell$!: Observable<Cell | undefined>;
  cellMembers$!: Observable<Member[]>;
  availableMembers$!: Observable<Member[]>;
  showAddMemberModal = false;
  private cellId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cellsService: CellsDatabaseService,
    private membersService: MembersDatabaseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/celulas']);
      return;
    }

    this.cellId = id;
    this.cell$ = this.cellsService.getCellById(id);

    // Limpar líder do array de membros (se estiver lá)
    this.cleanLeaderFromMembers();

    // Carregar membros da célula (REATIVO)
    this.cellMembers$ = combineLatest([
      this.cellsService.getCellById(id),
      this.membersService.getMembers()
    ]).pipe(
      map(([cell, allMembers]) => {
        if (!cell) return [];
        const memberIds = cell.memberIds || [];
        return allMembers.filter(m => memberIds.includes(m.id));
      })
    );

    // Membros disponíveis (REATIVO)
    this.availableMembers$ = combineLatest([
      this.cellsService.getCellById(id),
      this.membersService.getMembers()
    ]).pipe(
      map(([cell, allMembers]) => {
        if (!cell) return [];
        const memberIds = cell.memberIds || [];
        return allMembers.filter(m => 
          !memberIds.includes(m.id) && m.id !== cell.leaderId
        );
      })
    );
  }

  async addMember(memberId: string) {
    try {
      const cell = await firstValueFrom(this.cellsService.getCellById(this.cellId));

      if (cell) {
        // Verificar se já está na célula
        if (cell.memberIds?.includes(memberId)) {
          alert('Este membro já está cadastrado nesta célula.');
          return;
        }

        const updatedMemberIds = [...(cell.memberIds || []), memberId];
        await this.cellsService.updateCell(this.cellId, { memberIds: updatedMemberIds });
        this.showAddMemberModal = false;
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      alert('Erro ao adicionar membro.');
    }
  }

  async removeMember(memberId: string) {
    if (!confirm('Remover este membro da célula?')) return;

    try {
      const cell = await firstValueFrom(this.cellsService.getCellById(this.cellId));

      if (cell) {
        const updatedMemberIds = (cell.memberIds || []).filter(id => id !== memberId);
        await this.cellsService.updateCell(this.cellId, { memberIds: updatedMemberIds });
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      alert('Erro ao remover membro.');
    }
  }

  async cleanLeaderFromMembers() {
    try {
      const cell = await firstValueFrom(this.cell$);
      if (cell && cell.memberIds?.includes(cell.leaderId)) {
        const cleanedMemberIds = cell.memberIds.filter(id => id !== cell.leaderId);
        await this.cellsService.updateCell(this.cellId, { memberIds: cleanedMemberIds });
        console.log('Líder removido automaticamente da lista de membros');
      }
    } catch (error) {
      console.error('Erro ao limpar líder dos membros:', error);
    }
  }

  getWhatsAppLink(whatsapp: string): string {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  }
}
