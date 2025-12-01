import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MinistriesDatabaseService } from '../../core/services/ministries-database.service';
import { Ministry } from '../../shared/models/ministry.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-ministries',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Ministérios</h2>
          <p class="text-gray-500">Gerencie os ministérios e voluntários</p>
        </div>
        <button routerLink="novo" class="btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>Novo Ministério</span>
        </button>
      </div>

      <!-- Filtro por Categoria -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <select [formControl]="categoryFilter" class="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white">
          <option value="">Todas as Categorias</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Lista de Ministérios -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let ministry of filteredMinistries$ | async" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">{{ getCategoryIcon(ministry.category) }}</span>
                <h3 class="text-lg font-bold text-gray-900">{{ ministry.name }}</h3>
              </div>
              <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                {{ ministry.category }}
              </span>
            </div>
            <div class="flex gap-2">
              <button [routerLink]="['editar', ministry.id]" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                ✏️
              </button>
              <button (click)="deleteMinistry(ministry.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                🗑️
              </button>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ ministry.description || 'Sem descrição' }}</p>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span>👤</span>
              <span class="font-medium">Líder:</span>
              <span>{{ ministry.leaderName }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span>👥</span>
              <span class="font-medium">Voluntários:</span>
              <span>{{ ministry.volunteerIds.length || 0 }}</span>
            </div>
          </div>

          <!-- Botão Ver Detalhes -->
          <button [routerLink]="[ministry.id]" class="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2">
            <span>👁️</span>
            <span>Ver Detalhes</span>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="(filteredMinistries$ | async)?.length === 0" class="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <div class="text-4xl mb-4">🎤</div>
          <h3 class="text-lg font-medium text-gray-900">Nenhum ministério encontrado</h3>
          <p class="text-gray-500 mb-6">Comece criando o primeiro ministério da sua igreja.</p>
          <button routerLink="novo" class="btn-primary inline-flex items-center gap-2">
            <span>➕</span>
            <span>Criar Primeiro Ministério</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      @apply bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MinistriesComponent implements OnInit {
  ministries$: Observable<Ministry[]>;
  filteredMinistries$: Observable<Ministry[]>;
  categoryFilter = new FormControl('');
  categories: string[] = [];

  constructor(private ministriesService: MinistriesDatabaseService) {
    this.ministries$ = this.ministriesService.getMinistries();
    this.categories = this.ministriesService.getCategories();
    
    this.filteredMinistries$ = combineLatest([
      this.ministries$,
      this.categoryFilter.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([ministries, category]) => {
        if (!category) return ministries;
        return ministries.filter(m => m.category === category);
      })
    );
  }

  ngOnInit(): void {}

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

  async deleteMinistry(id: string) {
    if (confirm('Tem certeza que deseja excluir este ministério?')) {
      try {
        await this.ministriesService.deleteMinistry(id);
      } catch (error) {
        console.error('Erro ao excluir ministério:', error);
        alert('Erro ao excluir ministério.');
      }
    }
  }
}
