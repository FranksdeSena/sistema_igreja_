import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MinistriesDatabaseService } from '../../core/services/ministries-database.service';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Ministry } from '../../shared/models/ministry.model';
import { Member } from '../../shared/models/member.model';
import { Observable, combineLatest, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ministry-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-5xl mx-auto" *ngIf="ministry$ | async as ministry">
      <!-- Header -->
      <div class="mb-8">
        <button routerLink="/dashboard/ministerios" class="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4">
          <span>⬅️</span> Voltar
        </button>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-4xl">{{ getCategoryIcon(ministry.category) }}</span>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ ministry.name }}</h2>
              <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mt-1">
                {{ ministry.category }}
              </span>
            </div>
          </div>
          <button [routerLink]="['/dashboard/ministerios/editar', ministry.id]" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
            <span>✏️</span>
            <span>Editar</span>
          </button>
        </div>
      </div>

      <!-- Informações do Ministério -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Informações</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👤</span>
            <div>
              <p class="text-xs text-gray-400">Líder</p>
              <p class="font-medium text-gray-900">{{ ministry.leaderName }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">👥</span>
            <div>
              <p class="text-xs text-gray-400">Total de Voluntários</p>
              <p class="font-medium text-gray-900">{{ ministry.volunteerIds.length }}</p>
            </div>
          </div>
        </div>
        <div *ngIf="ministry.description" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-sm text-gray-600">{{ ministry.description }}</p>
        </div>
      </div>

      <!-- Gestão de Voluntários -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-900">Voluntários ({{ (ministryVolunteers$ | async)?.length || 0 }})</h3>
          <button (click)="showAddVolunteerModal = true" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
            <span>➕</span>
            <span>Adicionar Voluntário</span>
          </button>
        </div>

        <!-- Lista de Voluntários -->
        <div class="space-y-3" *ngIf="(ministryVolunteers$ | async)?.length! > 0; else noVolunteers">
          <div *ngFor="let volunteer of ministryVolunteers$ | async" class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl shadow-md">
                {{ volunteer.photo || '👤' }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ volunteer.name }}</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span>📍</span>
                  <span>{{ volunteer.address || 'Endereço não cadastrado' }}</span>
                </p>
                <a *ngIf="volunteer.whatsapp" [href]="getWhatsAppLink(volunteer.whatsapp)" target="_blank" class="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-1 hover:underline">
                  <span>💬</span>
                  <span>{{ volunteer.whatsapp }}</span>
                </a>
              </div>
            </div>
            <div class="flex gap-2">
              <button [routerLink]="['/dashboard/membros/editar', volunteer.id]" class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1" title="Editar voluntário">
                <span>✏️</span>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button (click)="removeVolunteer(volunteer.id)" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1" title="Remover do ministério">
                <span>🗑️</span>
                <span class="hidden sm:inline">Remover</span>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noVolunteers>
          <div class="text-center py-12 border border-dashed border-gray-200 rounded-xl">
            <div class="text-4xl mb-2">👥</div>
            <p class="text-gray-500">Nenhum voluntário adicionado ainda</p>
          </div>
        </ng-template>
      </div>

      <!-- Modal Adicionar Voluntário -->
      <div *ngIf="showAddVolunteerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Adicionar Voluntário</h3>
            <button (click)="showAddVolunteerModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          <div class="p-6 overflow-y-auto flex-1">
            <div class="space-y-3">
              <div *ngFor="let member of availableMembers$ | async" class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                    {{ member.photo || '👤' }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ member.name }}</p>
                    <p class="text-sm text-gray-500">{{ member.address }}</p>
                  </div>
                </div>
                <button (click)="addVolunteer(member.id)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Adicionar
                </button>
              </div>
              <div *ngIf="(availableMembers$ | async)?.length === 0" class="text-center py-8 text-gray-500">
                Todos os membros já estão neste ministério
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MinistryDetailsComponent implements OnInit {
  ministryId: string = '';
  ministry$!: Observable<Ministry | undefined>;
  ministryVolunteers$!: Observable<Member[]>;
  availableMembers$!: Observable<Member[]>;
  showAddVolunteerModal = false;

  constructor(
    private route: ActivatedRoute,
    private ministriesService: MinistriesDatabaseService,
    private membersService: MembersDatabaseService
  ) {}

  ngOnInit(): void {
    this.ministryId = this.route.snapshot.paramMap.get('id') || '';
    this.ministry$ = this.ministriesService.getMinistryById(this.ministryId);

    // Limpar líder do array de voluntários (se estiver lá)
    this.cleanLeaderFromVolunteers();

    // Carregar voluntários do ministério (REATIVO)
    this.ministryVolunteers$ = combineLatest([
      this.ministry$,
      this.membersService.getMembers()
    ]).pipe(
      map(([ministry, allMembers]) => {
        if (!ministry) return [];
        return allMembers.filter(m => ministry.volunteerIds.includes(m.id));
      })
    );

    // Membros disponíveis (não estão no ministério E não são o líder)
    this.availableMembers$ = combineLatest([
      this.ministry$,
      this.membersService.getMembers()
    ]).pipe(
      map(([ministry, allMembers]) => {
        if (!ministry) return [];
        return allMembers.filter(m => 
          !ministry.volunteerIds.includes(m.id) && m.id !== ministry.leaderId
        );
      })
    );
  }

  async cleanLeaderFromVolunteers() {
    try {
      const ministry = await firstValueFrom(this.ministry$);
      if (ministry && ministry.volunteerIds.includes(ministry.leaderId)) {
        const cleanedVolunteerIds = ministry.volunteerIds.filter(id => id !== ministry.leaderId);
        await this.ministriesService.updateMinistry(this.ministryId, { volunteerIds: cleanedVolunteerIds });
        console.log('Líder removido automaticamente da lista de voluntários');
      }
    } catch (error) {
      console.error('Erro ao limpar líder dos voluntários:', error);
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Louvor e Adoração': '🎤',
      'Mídia e Tecnologia': '📹',
      'Infantil': '👶',
      'Intercessão': '🙏',
      'Recepção': '🤝',
      'Limpeza e Organização': '🧹',
      'Ensino': '📖',
      'Evangelismo': '📢',
      'Outros': '⭐'
    };
    return icons[category] || '⭐';
  }

  async addVolunteer(memberId: string) {
    try {
      const ministry = await firstValueFrom(this.ministriesService.getMinistryById(this.ministryId));

      if (ministry) {
        // Verificar se já está no ministério
        if (ministry.volunteerIds.includes(memberId)) {
          alert('Este membro já está cadastrado neste ministério.');
          return;
        }

        const updatedVolunteerIds = [...ministry.volunteerIds, memberId];
        await this.ministriesService.updateMinistry(this.ministryId, { volunteerIds: updatedVolunteerIds });
        this.showAddVolunteerModal = false;
      }
    } catch (error) {
      console.error('Erro ao adicionar voluntário:', error);
      alert('Erro ao adicionar voluntário.');
    }
  }

  async removeVolunteer(memberId: string) {
    if (!confirm('Remover este voluntário do ministério?')) return;

    try {
      const ministry = await firstValueFrom(this.ministriesService.getMinistryById(this.ministryId));

      if (ministry) {
        const updatedVolunteerIds = ministry.volunteerIds.filter(id => id !== memberId);
        await this.ministriesService.updateMinistry(this.ministryId, { volunteerIds: updatedVolunteerIds });
      }
    } catch (error) {
      console.error('Erro ao remover voluntário:', error);
      alert('Erro ao remover voluntário.');
    }
  }

  getWhatsAppLink(whatsapp: string): string {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  }
}
