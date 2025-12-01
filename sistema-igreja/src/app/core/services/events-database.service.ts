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
    
    // Preparar dados para atualização
    const data: any = {
      ...eventData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Converter data se presente
    if (eventData.date) {
      // Garantir que é um objeto Date válido
      const dateObj = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);
      if (!isNaN(dateObj.getTime())) {
        data.date = Timestamp.fromDate(dateObj);
      } else {
        delete data.date; // Não atualizar se data for inválida
      }
    }

    // Remover campos undefined para evitar erros no Firestore
    Object.keys(data).forEach(key => 
      data[key] === undefined && delete data[key]
    );

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
    return this.getEvents().pipe(
      map(events => events.filter(e => e.category === category))
    );
  }

  /**
   * Retorna eventos por status
   */
  getEventsByStatus(status: string): Observable<Event[]> {
    return this.getEvents().pipe(
      map(events => events.filter(e => e.status === status))
    );
  }

  /**
   * Retorna eventos futuros (próximos)
   */
  getUpcomingEvents(): Observable<Event[]> {
    return this.getEvents().pipe(
      map(events => {
        const now = new Date();
        return events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && (event.status === 'scheduled' || event.status === 'ongoing');
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      })
    );
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
   * Resumo completo de eventos
   */
  getEventSummary(): Observable<EventSummary> {
    return combineLatest([
      this.getTotalEvents(),
      this.getUpcomingEventsCount(),
      this.getCompletedEventsCount()
    ]).pipe(
      map(([total, upcoming, completed]) => ({
        totalEvents: total,
        upcomingEvents: upcoming,
        completedEvents: completed
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
