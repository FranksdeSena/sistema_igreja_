import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event, EventSummary } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventsSubject = new BehaviorSubject<Event[]>([
    {
      id: '1',
      churchId: 'church-1',
      name: 'Culto Dominical',
      description: 'Culto principal aos domingos com pregação e adoração',
      date: new Date(2025, 10, 16),
      time: '10:00',
      location: 'Templo Principal',
      category: 'Culto',
      capacity: 200,
      registered: 145,
      status: 'scheduled',
      responsible: 'Pastor João',
      coordinator: 'Diácono Pedro',
      notes: 'Preparar equipamento de som',
      createdAt: new Date(2025, 10, 10),
      updatedAt: new Date(2025, 10, 10),
      createdBy: 'Secretária Maria',
    },
    {
      id: '2',
      churchId: 'church-1',
      name: 'Reunião de Diáconos',
      description: 'Reunião administrativa com diáconos para planejamento',
      date: new Date(2025, 10, 18),
      time: '19:30',
      location: 'Sala de Reuniões',
      category: 'Reunião',
      capacity: 25,
      registered: 18,
      status: 'scheduled',
      responsible: 'Pastor João',
      coordinator: 'Diácono Carlos',
      notes: 'Pautar: orçamento e eventos futuros',
      createdAt: new Date(2025, 10, 12),
      updatedAt: new Date(2025, 10, 12),
      createdBy: 'Secretária Maria',
    },
    {
      id: '3',
      churchId: 'church-1',
      name: 'Estudo Bíblico',
      description: 'Estudo em grupo do livro de Romanos',
      date: new Date(2025, 10, 20),
      time: '20:00',
      location: 'Templo Principal',
      category: 'Treinamento',
      capacity: 100,
      registered: 67,
      status: 'scheduled',
      responsible: 'Pastor Lucas',
      coordinator: 'Professora Ana',
      notes: 'Levar Bíblias e material didático',
      createdAt: new Date(2025, 10, 13),
      updatedAt: new Date(2025, 10, 13),
      createdBy: 'Secretária Maria',
    },
  ]);

  private eventsObservable$ = this.eventsSubject.asObservable();

  constructor() {}

  // Obter todos os eventos
  getEvents(): Observable<Event[]> {
    return this.eventsObservable$;
  }

  // Obter evento por ID
  getEvent(id: string): Event | undefined {
    return this.eventsSubject.value.find((e) => e.id === id);
  }

  // Criar novo evento
  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const current = this.eventsSubject.value;
    this.eventsSubject.next([...current, newEvent]);
  }

  // Atualizar evento
  updateEvent(id: string, updates: Partial<Event>): void {
    const current = this.eventsSubject.value;
    const updated = current.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
    );
    this.eventsSubject.next(updated);
  }

  // Deletar evento
  deleteEvent(id: string): void {
    const current = this.eventsSubject.value;
    this.eventsSubject.next(current.filter((e) => e.id !== id));
  }

  // Buscar eventos por categoria
  getEventsByCategory(category: string): Observable<Event[]> {
    return new Observable((observer) => {
      this.eventsObservable$.subscribe((events) => {
        observer.next(events.filter((e) => e.category === category));
      });
    });
  }

  // Buscar eventos por status
  getEventsByStatus(status: string): Observable<Event[]> {
    return new Observable((observer) => {
      this.eventsObservable$.subscribe((events) => {
        observer.next(events.filter((e) => e.status === status));
      });
    });
  }

  // Buscar eventos por período
  getEventsByDateRange(startDate: Date, endDate: Date): Observable<Event[]> {
    return new Observable((observer) => {
      this.eventsObservable$.subscribe((events) => {
        observer.next(events.filter((e) => e.date >= startDate && e.date <= endDate));
      });
    });
  }

  // Calcular resumo de eventos
  getEventSummary(): Observable<EventSummary> {
    return new Observable((observer) => {
      this.eventsObservable$.subscribe((events) => {
        const upcomingEvents = events.filter((e) => e.status === 'scheduled').length;
        const completedEvents = events.filter((e) => e.status === 'completed').length;
        const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);
        const averageCapacity =
          events.length > 0
            ? Math.round(events.reduce((sum, e) => sum + e.capacity, 0) / events.length)
            : 0;

        observer.next({
          totalEvents: events.length,
          upcomingEvents,
          completedEvents,
          totalRegistered,
          averageCapacity,
        });
      });
    });
  }

  // Obter categorias disponíveis
  getCategories(): string[] {
    return ['Culto', 'Reunião', 'Treinamento', 'Social', 'Missão', 'Outra'];
  }

  // Buscar eventos com filtros
  searchEvents(query: string): Observable<Event[]> {
    return new Observable((observer) => {
      this.eventsObservable$.subscribe((events) => {
        const filtered = events.filter(
          (e) =>
            e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.location.toLowerCase().includes(query.toLowerCase()) ||
            e.responsible.toLowerCase().includes(query.toLowerCase()) ||
            e.description.toLowerCase().includes(query.toLowerCase())
        );
        observer.next(filtered);
      });
    });
  }
}
