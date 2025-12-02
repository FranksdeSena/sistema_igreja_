import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsDatabaseService } from '../../../core/services/events-database.service';
import { Event as EventModel } from '../../../shared/models/event.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-public-agenda',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Agenda da Igreja</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Fique por dentro de tudo o que acontece em nossa comunidade.
          </p>
        </div>

        <!-- Timeline -->
        <div class="max-w-4xl mx-auto">
          <div *ngIf="events$ | async as events; else loading">
            <div *ngIf="events.length > 0; else empty" class="space-y-8">
              
              <div *ngFor="let event of events" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                <!-- Date Box -->
                <div class="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-24 bg-blue-50 rounded-xl p-4 text-primary-blue">
                  <span class="text-3xl font-bold">{{ event.date | date:'dd' }}</span>
                  <span class="text-sm font-medium uppercase">{{ event.date | date:'MMM' }}</span>
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 class="text-xl font-bold text-gray-900">{{ event.name }}</h3>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      🕒 {{ event.time }}
                    </span>
                  </div>
                  
                  <p class="text-gray-600 mb-4">{{ event.description || 'Venha participar conosco deste momento especial.' }}</p>
                  
                  <div class="flex items-center text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      📍 {{ event.location || 'Templo Principal' }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
            
            <ng-template #empty>
              <div class="text-center py-12 bg-white rounded-2xl shadow-sm">
                <p class="text-4xl mb-4">📅</p>
                <h3 class="text-lg font-medium text-gray-900">Nenhum evento programado</h3>
                <p class="text-gray-500 mt-2">Volte em breve para conferir nossa agenda.</p>
              </div>
            </ng-template>
          </div>

          <ng-template #loading>
            <div class="flex justify-center py-20">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PublicAgendaComponent implements OnInit {
  events$: Observable<EventModel[]>;

  constructor(private eventsService: EventsDatabaseService) {
    // Busca eventos futuros e ordena por data
    this.events$ = this.eventsService.getEvents().pipe(
      map(events => {
        const now = new Date();
        return events
          .filter(e => e.status === 'scheduled' && new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      })
    );
  }

  ngOnInit(): void {}
}
