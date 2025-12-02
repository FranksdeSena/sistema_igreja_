import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersDatabaseService } from '../../../core/services/members-database.service';
import { MinistriesDatabaseService } from '../../../core/services/ministries-database.service';
import { CellsDatabaseService } from '../../../core/services/cells-database.service';
import { Member } from '../../../shared/models/member.model';
import { Ministry } from '../../../shared/models/ministry.model';
import { Cell } from '../../../shared/models/cell.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface LeadershipGroup {
  title: string;
  description: string;
  items: any[];
  type: 'member' | 'ministry' | 'cell';
  icon: string;
}

@Component({
  selector: 'app-leadership',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Hero -->
      <div class="relative bg-gradient-to-br from-blue-600 to-purple-600 py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-3xl mx-auto">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">Nossa Liderança e Ministérios</h1>
          <p class="text-xl text-blue-100">
            Conheça quem faz a obra acontecer e participe!
          </p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <!-- Groups -->
        <div *ngFor="let group of leadershipGroups$ | async" class="mb-20">
          <div class="text-center mb-12">
            <div class="text-5xl mb-4">{{ group.icon }}</div>
            <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ group.title }}</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">{{ group.description }}</p>
          </div>

          <div *ngIf="group.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <!-- Card de Membro (Pastor/Intercessão) -->
            <ng-container *ngIf="group.type === 'member'">
              <div *ngFor="let member of group.items" 
                   class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
                <div class="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                  <img *ngIf="member.photo" [src]="member.photo" [alt]="member.name" class="w-full h-full object-cover">
                  <div *ngIf="!member.photo" class="w-full h-full flex items-center justify-center text-6xl text-gray-400">👤</div>
                </div>
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ member.name }}</h3>
                  <p class="text-primary-blue font-medium text-sm mb-3">{{ getRoleDisplay(member.role || 'Membro') }}</p>
                  <div class="space-y-2 text-sm text-gray-600">
                    <p *ngIf="member.email" class="flex items-center gap-2"><span>✉️</span> <a [href]="'mailto:' + member.email" class="hover:text-primary-blue truncate">{{ member.email }}</a></p>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- Card de Ministério -->
            <ng-container *ngIf="group.type === 'ministry'">
              <div *ngFor="let ministry of group.items" 
                   class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 p-6 flex flex-col h-full">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4 text-purple-600">
                  🙌
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ ministry.name }}</h3>
                <p class="text-gray-600 text-sm mb-4 flex-grow">{{ ministry.description || 'Ministério ativo na igreja.' }}</p>
                <div class="pt-4 border-t border-gray-100">
                  <p class="text-sm font-medium text-gray-900">Líder: <span class="text-purple-600">{{ ministry.leaderName }}</span></p>
                  <p *ngIf="ministry.meetingDay" class="text-xs text-gray-500 mt-1">📅 {{ ministry.meetingDay }} às {{ ministry.meetingTime }}</p>
                </div>
              </div>
            </ng-container>

            <!-- Card de Célula -->
            <ng-container *ngIf="group.type === 'cell'">
              <div *ngFor="let cell of group.items" 
                   class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2 p-6 flex flex-col h-full">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4 text-green-600">
                  🏠
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ cell.name }}</h3>
                <p class="text-gray-600 text-sm mb-4 flex-grow">{{ cell.description || 'Célula de comunhão e crescimento.' }}</p>
                <div class="pt-4 border-t border-gray-100">
                  <p class="text-sm font-medium text-gray-900">Líder: <span class="text-green-600">{{ cell.leaderName }}</span></p>
                  <p class="text-sm text-gray-600 mt-1">📍 {{ cell.address }}</p>
                  <p *ngIf="cell.meetingDay" class="text-xs text-gray-500 mt-1">📅 {{ cell.meetingDay }} às {{ cell.meetingTime }}</p>
                </div>
              </div>
            </ng-container>

          </div>

          <div *ngIf="group.items.length === 0" class="text-center py-12 bg-gray-50 rounded-xl">
            <p class="text-gray-500">Nenhum item nesta categoria no momento.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LeadershipComponent implements OnInit {
  leadershipGroups$: Observable<LeadershipGroup[]>;

  constructor(
    private membersService: MembersDatabaseService,
    private ministriesService: MinistriesDatabaseService,
    private cellsService: CellsDatabaseService
  ) {
    this.leadershipGroups$ = combineLatest([
      this.membersService.getMembers(),
      this.ministriesService.getMinistries(),
      this.cellsService.getCells()
    ]).pipe(
      map(([members, ministries, cells]) => {
        const activeMembers = members.filter(m => m.status === 'active');
        
        return [
          {
            title: 'Liderança Pastoral',
            description: 'Nossa equipe pastoral dedicada ao ensino da Palavra e cuidado espiritual',
            icon: '✝️',
            type: 'member',
            items: activeMembers.filter(m => 
              m.role?.toLowerCase().includes('pastor')
            )
          },
          {
            title: 'Intercessão',
            description: 'Equipe dedicada à oração e clamor pela igreja e nações',
            icon: '🙏',
            type: 'member',
            items: activeMembers.filter(m => 
              m.role?.toLowerCase().includes('intercessão') || 
              m.role?.toLowerCase().includes('intercessao') ||
              m.role?.toLowerCase().includes('oração')
            )
          },
          {
            title: 'Ministérios',
            description: 'Áreas de serviço onde você pode se envolver e servir',
            icon: '🙌',
            type: 'ministry',
            items: ministries
          },
          {
            title: 'Células',
            description: 'Pequenos grupos de comunhão nos lares',
            icon: '🏠',
            type: 'cell',
            items: cells
          }
        ] as LeadershipGroup[];
      })
    );
  }

  ngOnInit(): void {}

  getRoleDisplay(role: string): string {
    return role;
  }
}
