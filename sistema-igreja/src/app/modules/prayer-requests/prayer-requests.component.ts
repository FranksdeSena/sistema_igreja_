import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrayerRequestsDatabaseService } from '../../core/services/prayer-requests-database.service';
import { PrayerRequest } from '../../shared/models/prayer-request.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-prayer-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Pedidos de Oração</h1>
        <div class="text-sm text-gray-600">
          Total: {{ (prayerRequests$ | async)?.length || 0 }} pedidos
        </div>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let request of prayerRequests$ | async" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ request.name }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 max-w-md">
                  <div class="line-clamp-2">{{ request.request }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div *ngIf="request.email" class="text-xs">📧 {{ request.email }}</div>
                  <div *ngIf="request.phone" class="text-xs">📞 {{ request.phone }}</div>
                  <div *ngIf="!request.email && !request.phone" class="text-xs text-gray-400">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span *ngIf="request.isPrayed" 
                          class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      ✓ Orado
                    </span>
                    <span *ngIf="request.isPublic" 
                          class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Público
                    </span>
                    <span *ngIf="request.isApproved && !request.isPublic" 
                          class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Aprovado
                    </span>
                    <span *ngIf="!request.isApproved" 
                          class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      Pendente
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ request.createdAt | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-y-1">
                  <div class="flex flex-col gap-1">
                    <button 
                      *ngIf="!request.isPrayed"
                      (click)="markAsPrayed(request.id)"
                      class="text-blue-600 hover:text-blue-800 text-left">
                      ✓ Marcar como Orado
                    </button>
                    <button 
                      *ngIf="!request.isApproved"
                      (click)="approve(request.id, false)"
                      class="text-green-600 hover:text-green-800 text-left">
                      ✓ Aprovar (Privado)
                    </button>
                    <button 
                      *ngIf="!request.isPublic"
                      (click)="approve(request.id, true)"
                      class="text-purple-600 hover:text-purple-800 text-left">
                      🌐 Tornar Público
                    </button>
                    <button 
                      (click)="delete(request.id)"
                      class="text-red-600 hover:text-red-800 text-left">
                      🗑️ Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="!(prayerRequests$ | async)?.length" class="p-12 text-center text-gray-500">
          <p class="text-4xl mb-4">🙏</p>
          <p>Nenhum pedido de oração ainda.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PrayerRequestsComponent implements OnInit {
  prayerRequests$: Observable<PrayerRequest[]>;

  constructor(private prayerService: PrayerRequestsDatabaseService) {
    this.prayerRequests$ = this.prayerService.getPrayerRequests();
  }

  ngOnInit(): void {}

  async markAsPrayed(id: string): Promise<void> {
    if (confirm('Marcar este pedido como orado?')) {
      await this.prayerService.markAsPrayed(id);
    }
  }

  async approve(id: string, makePublic: boolean): Promise<void> {
    const message = makePublic 
      ? 'Aprovar e tornar este pedido público?' 
      : 'Aprovar este pedido (mantendo privado)?';
    
    if (confirm(message)) {
      await this.prayerService.approvePrayerRequest(id, makePublic);
    }
  }

  async delete(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir este pedido permanentemente?')) {
      await this.prayerService.deletePrayerRequest(id);
    }
  }
}
