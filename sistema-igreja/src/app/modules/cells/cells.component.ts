import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CellsDatabaseService } from '../../core/services/cells-database.service';
import { Cell } from '../../shared/models/cell.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cells',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Células</h2>
          <p class="text-gray-500">Gerencie os pequenos grupos</p>
        </div>
        <button routerLink="nova" class="btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>Nova Célula</span>
        </button>
      </div>

      <!-- Lista de Células -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let cell of cells$ | async" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ cell.name }}</h3>
              <p class="text-sm text-gray-500">{{ cell.description || 'Sem descrição' }}</p>
            </div>
            <div class="flex gap-2">
              <button [routerLink]="['editar', cell.id]" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                ✏️
              </button>
              <button (click)="deleteCell(cell.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                🗑️
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3 text-gray-600">
              <span class="text-xl">👤</span>
              <div>
                <p class="text-xs text-gray-400">Líder</p>
                <p class="font-medium">{{ cell.leaderName || 'Não definido' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 text-gray-600">
              <span class="text-xl">📅</span>
              <div>
                <p class="text-xs text-gray-400">Encontro</p>
                <p class="font-medium">{{ cell.meetingDay }} às {{ cell.meetingTime }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 text-gray-600">
              <span class="text-xl">📍</span>
              <div>
                <p class="text-xs text-gray-400">Local</p>
                <p class="font-medium">{{ cell.address }}</p>
              </div>
            </div>
          </div>

          <!-- Botão Ver Detalhes -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <button [routerLink]="[cell.id]" class="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2">
              <span>👁️</span>
              <span>Ver Detalhes e Membros</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="(cells$ | async)?.length === 0" class="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <div class="text-4xl mb-4">🏘️</div>
          <h3 class="text-lg font-medium text-gray-900">Nenhuma célula cadastrada</h3>
          <p class="text-gray-500 mb-6">Comece criando o primeiro pequeno grupo da sua igreja.</p>
          <button routerLink="nova" class="btn-primary inline-flex items-center gap-2">
            <span>➕</span>
            <span>Criar Primeira Célula</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      @apply bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow shadow-blue-200;
    }
  `]
})
export class CellsComponent implements OnInit {
  cells$: Observable<Cell[]>;

  constructor(private cellsService: CellsDatabaseService) {
    this.cells$ = this.cellsService.getCells();
  }

  ngOnInit(): void {}

  async deleteCell(id: string) {
    if (confirm('Tem certeza que deseja excluir esta célula?')) {
      try {
        await this.cellsService.deleteCell(id);
      } catch (error) {
        console.error('Erro ao excluir célula:', error);
        alert('Erro ao excluir célula.');
      }
    }
  }
}
