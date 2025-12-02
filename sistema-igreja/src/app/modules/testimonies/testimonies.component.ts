import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TestimoniesDatabaseService } from '../../core/services/testimonies-database.service';
import { Testimony } from '../../shared/models/testimony.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-testimonies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Testemunhos</h1>
        <button 
          routerLink="/testemunhos/novo"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Novo Testemunho
        </button>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let testimony of testimonies$ | async" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ testimony.authorName }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ testimony.title }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ testimony.category || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span *ngIf="testimony.isApproved && testimony.isPublic" 
                        class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Publicado
                  </span>
                  <span *ngIf="!testimony.isApproved" 
                        class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    Pendente
                  </span>
                  <span *ngIf="testimony.isApproved && !testimony.isPublic" 
                        class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    Aprovado (Oculto)
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ testimony.createdAt | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button 
                    *ngIf="!testimony.isApproved"
                    (click)="approveTestimony(testimony.id)"
                    class="text-green-600 hover:text-green-800">
                    ✓ Aprovar
                  </button>
                  <button 
                    *ngIf="testimony.isApproved && testimony.isPublic"
                    (click)="hideTestimony(testimony.id)"
                    class="text-orange-600 hover:text-orange-800">
                    👁️ Ocultar
                  </button>
                  <button 
                    (click)="deleteTestimony(testimony.id)"
                    class="text-red-600 hover:text-red-800">
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!(testimonies$ | async)?.length" class="p-12 text-center text-gray-500">
          <p class="text-4xl mb-4">💬</p>
          <p>Nenhum testemunho cadastrado ainda.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TestimoniesComponent implements OnInit {
  testimonies$: Observable<Testimony[]>;

  constructor(private testimoniesService: TestimoniesDatabaseService) {
    this.testimonies$ = this.testimoniesService.getTestimonies();
  }

  ngOnInit(): void {}

  async approveTestimony(id: string): Promise<void> {
    if (confirm('Aprovar e publicar este testemunho?')) {
      await this.testimoniesService.approveTestimony(id);
    }
  }

  async hideTestimony(id: string): Promise<void> {
    if (confirm('Ocultar este testemunho do site público?')) {
      await this.testimoniesService.rejectTestimony(id);
    }
  }

  async deleteTestimony(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este testemunho permanentemente?')) {
      await this.testimoniesService.deleteTestimony(id);
    }
  }
}
