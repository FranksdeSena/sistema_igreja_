import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event, EventSummary } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class EventsDatabaseService {
  private eventsCollection;

  constructor(private firestore: Firestore) {
    this.eventsCollection = collection(this.firestore, 'events');
  }

  // ==================== CRUD de Eventos ====================

  /**
   * Adiciona um novo evento ao Firestore
   */
  async addEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const data = {
      ...eventData,
      date: Timestamp.fromDate(new Date(eventData.date)),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };

    const docRef = await addDoc(this.eventsCollection, data);
    return docRef.id;
  }

  /**
   * Retorna todos os eventos em tempo real
   */
  getEvents(): Observable<Event[]> {
    return new Observable<Event[]>(observer => {
      const q = query(this.eventsCollection, orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Event;
        });
        observer.next(events);
      }, (error) => {
        console.error('Erro ao buscar eventos:', error);
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  /**
   * Retorna um evento específico por ID
   */
  getEventById(id: string): Observable<Event | null> {
    return new Observable<Event | null>(observer => {
      const docRef = doc(this.firestore, 'events', id);
      
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const event: Event = {
            id: snapshot.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Event;
          observer.next(event);
        } else {
          observer.next(null);
        }
      }, (error) => {
        console.error('Erro ao buscar evento:', error);
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  /**
   * Atualiza um evento existente
   */
  async updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
    const docRef = doc(this.firestore, 'events', id);
    const data: any = {
      ...eventData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    if (eventData.date) {
      data.date = Timestamp.fromDate(new Date(eventData.date));
    }

    await updateDoc(docRef, data);
  }

  /**
   * Deleta um evento
   */
  async deleteEvent(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'events', id);
    await deleteDoc(docRef);
  }

  // ==================== Filtros e Buscas ====================

  /**
   * Retorna eventos por categoria
   */
  getEventsByCategory(category: string): Observable<Event[]> {
    return new Observable<Event[]>(observer => {
      const q = query(
        this.eventsCollection,
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Event;
        });
        observer.next(events);
      });

      return () => unsubscribe();
    });
  }

  /**
   * Retorna eventos por status
   */
  getEventsByStatus(status: string): Observable<Event[]> {
    return new Observable<Event[]>(observer => {
      const q = query(
        this.eventsCollection,
        where('status', '==', status),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Event;
        });
        observer.next(events);
      });

      return () => unsubscribe();
    });
  }

  /**
   * Retorna eventos futuros (próximos)
   */
  getUpcomingEvents(): Observable<Event[]> {
    return new Observable<Event[]>(observer => {
      const now = Timestamp.fromDate(new Date());
      const q = query(
        this.eventsCollection,
        where('date', '>=', now),
        where('status', 'in', ['scheduled', 'ongoing']),
        orderBy('date', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Event;
        });
        observer.next(events);
      });

      return () => unsubscribe();
    });
  }

  // ==================== Contadores em Tempo Real ====================

  /**
   * Total de eventos
   */
  getTotalEvents(): Observable<number> {
    return this.getEvents().pipe(
      map(events => events.length)
    );
  }

  /**
   * Total de eventos futuros
   */
  getUpcomingEventsCount(): Observable<number> {
    return this.getUpcomingEvents().pipe(
      map(events => events.length)
    );
  }

  /**
   * Total de eventos concluídos
   */
  getCompletedEventsCount(): Observable<number> {
    return this.getEventsByStatus('completed').pipe(
      map(events => events.length)
    );
  }

  /**
   * Total de pessoas registradas em todos os eventos
   */
  getTotalRegistered(): Observable<number> {
    return this.getEvents().pipe(
      map(events => events.reduce((sum, event) => sum + (event.registered || 0), 0))
    );
  }

  /**
   * Capacidade média dos eventos
   */
  getAverageCapacity(): Observable<number> {
    return this.getEvents().pipe(
      map(events => {
        if (events.length === 0) return 0;
        const total = events.reduce((sum, event) => sum + (event.capacity || 0), 0);
        return Math.round(total / events.length);
      })
    );
  }

  /**
   * Resumo completo de eventos
   */
  getEventSummary(): Observable<EventSummary> {
    return combineLatest([
      this.getTotalEvents(),
      this.getUpcomingEventsCount(),
      this.getCompletedEventsCount(),
      this.getTotalRegistered(),
      this.getAverageCapacity()
    ]).pipe(
      map(([total, upcoming, completed, registered, avgCapacity]) => ({
        totalEvents: total,
        upcomingEvents: upcoming,
        completedEvents: completed,
        totalRegistered: registered,
        averageCapacity: avgCapacity
      }))
    );
  }

  // ==================== Utilitários ====================

  /**
   * Retorna as categorias disponíveis
   */
  getCategories(): string[] {
    return [
      'Culto',
      'Reunião',
      'Treinamento',
      'Social',
      'Missão',
      'Conferência',
      'Retiro',
      'Evangelismo',
      'Outra'
    ];
  }

  /**
   * Retorna os status disponíveis
   */
  getStatuses(): Array<{ value: string; label: string }> {
    return [
      { value: 'scheduled', label: '📅 Agendado' },
      { value: 'ongoing', label: '🔴 Em Andamento' },
      { value: 'completed', label: '✅ Concluído' },
      { value: 'cancelled', label: '❌ Cancelado' }
    ];
  }
}
