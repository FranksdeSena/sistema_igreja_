import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Sermon, PastoralVisit, PastoralSummary, PastorDailyMessage } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class PastorService {
  private sermonsSubject = new BehaviorSubject<Sermon[]>([
    {
      id: '1',
      churchId: 'church-1',
      title: 'O Poder da Fé',
      pastor: 'Pastor João',
      biblicalText: 'Romanos 10:17',
      date: new Date(2025, 10, 9),
      duration: 45,
      summary: 'Pregação sobre como a fé nos liberta do medo e nos capacita para grandes coisas',
      topicCategory: 'Fé',
      status: 'completed',
      attendance: 187,
      notes: 'Pregação bem recebida pela congregação',
      createdAt: new Date(2025, 10, 9),
      updatedAt: new Date(2025, 10, 9),
      createdBy: 'Secretária Maria',
    },
    {
      id: '2',
      churchId: 'church-1',
      title: 'Graça Abundante',
      pastor: 'Pastor Lucas',
      biblicalText: 'Efésios 2:8-9',
      date: new Date(2025, 10, 16),
      duration: 52,
      summary: 'Mensagem sobre a graça de Deus que nos salva independentemente de nossas obras',
      topicCategory: 'Graça',
      status: 'completed',
      attendance: 156,
      notes: 'Ótima participação durante a oração final',
      createdAt: new Date(2025, 10, 16),
      updatedAt: new Date(2025, 10, 16),
      createdBy: 'Secretária Maria',
    },
  ]);

  private visitsSubject = new BehaviorSubject<PastoralVisit[]>([
    {
      id: '1',
      churchId: 'church-1',
      memberId: 'mem-001',
      memberName: 'João Silva',
      pastor: 'Pastor João',
      date: new Date(2025, 10, 12),
      time: '14:00',
      visitType: 'Acompanhamento',
      subject: 'Acompanhamento espiritual',
      outcome: 'Membro fortalecido na fé, oração realizada',
      status: 'completed',
      followUpNeeded: true,
      followUpDate: new Date(2025, 11, 12),
      notes: 'Conversa muito produtiva',
      createdAt: new Date(2025, 10, 12),
      updatedAt: new Date(2025, 10, 12),
      createdBy: 'Pastor João',
    },
    {
      id: '2',
      churchId: 'church-1',
      memberId: 'mem-002',
      memberName: 'Maria Santos',
      pastor: 'Pastor Lucas',
      date: new Date(2025, 10, 14),
      time: '10:30',
      visitType: 'Doença',
      subject: 'Visita de oração durante enfermidade',
      outcome: 'Oração realizada, membro consolado',
      status: 'completed',
      followUpNeeded: true,
      followUpDate: new Date(2025, 10, 21),
      notes: 'Paciente em recuperação, família fortalecida',
      createdAt: new Date(2025, 10, 14),
      updatedAt: new Date(2025, 10, 14),
      createdBy: 'Pastor Lucas',
    },
  ]);

  // Palavra do Pastor (Mensagens Diárias)
  private dailyMessagesSubject = new BehaviorSubject<PastorDailyMessage[]>([
    {
      id: '1',
      churchId: 'church-1',
      title: 'A Importância da Fé em Tempos Difíceis',
      pastor: 'Pastor João',
      message:
        'Quando enfrentamos dificuldades, é fácil perder a esperança. Mas a Palavra de Deus nos assegura que Ele está conosco em todo tempo. Nossa fé não depende das circunstâncias, mas do caráter eterno de Deus.',
      biblicalText: 'Hebreus 11:1',
      date: new Date(2025, 10, 17),
      status: 'published',
      tags: ['Fé', 'Esperança', 'Deus'],
      createdAt: new Date(2025, 10, 17),
      updatedAt: new Date(2025, 10, 17),
    },
  ]);

  private sermonsObservable$ = this.sermonsSubject.asObservable();
  private visitsObservable$ = this.visitsSubject.asObservable();
  private dailyMessagesObservable$ = this.dailyMessagesSubject.asObservable();

  constructor() {}

  // ========== SERMÕES ==========

  // Obter todos os sermões
  getSermons(): Observable<Sermon[]> {
    return this.sermonsObservable$;
  }

  // Obter sermão por ID
  getSermon(id: string): Sermon | undefined {
    return this.sermonsSubject.value.find((s) => s.id === id);
  }

  // Criar novo sermão
  createSermon(sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newSermon: Sermon = {
      ...sermon,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const current = this.sermonsSubject.value;
    this.sermonsSubject.next([...current, newSermon]);
  }

  // Atualizar sermão
  updateSermon(id: string, updates: Partial<Sermon>): void {
    const current = this.sermonsSubject.value;
    const updated = current.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
    );
    this.sermonsSubject.next(updated);
  }

  // Deletar sermão
  deleteSermon(id: string): void {
    const current = this.sermonsSubject.value;
    this.sermonsSubject.next(current.filter((s) => s.id !== id));
  }

  // ========== VISITAS PASTORAIS ==========

  // Obter todas as visitas
  getVisits(): Observable<PastoralVisit[]> {
    return this.visitsObservable$;
  }

  // Obter visita por ID
  getVisit(id: string): PastoralVisit | undefined {
    return this.visitsSubject.value.find((v) => v.id === id);
  }

  // Criar nova visita
  createVisit(visit: Omit<PastoralVisit, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newVisit: PastoralVisit = {
      ...visit,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const current = this.visitsSubject.value;
    this.visitsSubject.next([...current, newVisit]);
  }

  // Atualizar visita
  updateVisit(id: string, updates: Partial<PastoralVisit>): void {
    const current = this.visitsSubject.value;
    const updated = current.map((v) =>
      v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v
    );
    this.visitsSubject.next(updated);
  }

  // Deletar visita
  deleteVisit(id: string): void {
    const current = this.visitsSubject.value;
    this.visitsSubject.next(current.filter((v) => v.id !== id));
  }

  // ========== FILTROS E BUSCAS ==========

  // Buscar sermões por pastor
  getSermonsByPastor(pastor: string): Observable<Sermon[]> {
    return new Observable((observer) => {
      this.sermonsObservable$.subscribe((sermons) => {
        observer.next(sermons.filter((s) => s.pastor === pastor));
      });
    });
  }

  // Buscar sermões por categoria
  getSermonsByCategory(category: string): Observable<Sermon[]> {
    return new Observable((observer) => {
      this.sermonsObservable$.subscribe((sermons) => {
        observer.next(sermons.filter((s) => s.topicCategory === category));
      });
    });
  }

  // Buscar visitas por status
  getVisitsByStatus(status: string): Observable<PastoralVisit[]> {
    return new Observable((observer) => {
      this.visitsObservable$.subscribe((visits) => {
        observer.next(visits.filter((v) => v.status === status));
      });
    });
  }

  // Buscar visitas por pastor
  getVisitsByPastor(pastor: string): Observable<PastoralVisit[]> {
    return new Observable((observer) => {
      this.visitsObservable$.subscribe((visits) => {
        observer.next(visits.filter((v) => v.pastor === pastor));
      });
    });
  }

  // Calcular resumo pastoral
  getPastoralSummary(): Observable<PastoralSummary> {
    return new Observable((observer) => {
      this.sermonsObservable$.subscribe((sermons) => {
        this.visitsObservable$.subscribe((visits) => {
          const completedVisits = visits.filter((v) => v.status === 'completed').length;
          const pendingVisits = visits.filter((v) => v.status === 'scheduled').length;
          const totalAttendance = sermons.reduce((sum, s) => sum + (s.attendance || 0), 0);
          const averageDuration =
            sermons.length > 0
              ? Math.round(sermons.reduce((sum, s) => sum + (s.duration || 0), 0) / sermons.length)
              : 0;

          observer.next({
            totalSermons: sermons.length,
            totalVisits: visits.length,
            completedVisits,
            pendingVisits,
            totalAttendance,
            averageDuration,
          });
        });
      });
    });
  }

  // Obter categorias de sermão
  getSermonCategories(): string[] {
    return ['Salvação', 'Amor', 'Fé', 'Graça', 'Missão', 'Outro'];
  }

  // Obter tipos de visita
  getVisitTypes(): string[] {
    return ['Acompanhamento', 'Oração', 'Aconselhamento', 'Doença', 'Bem-vindo', 'Outro'];
  }

  // Buscar sermões
  searchSermons(query: string): Observable<Sermon[]> {
    return new Observable((observer) => {
      this.sermonsObservable$.subscribe((sermons) => {
        const filtered = sermons.filter(
          (s) =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            (s.pastor?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (s.biblicalText?.toLowerCase() || '').includes(query.toLowerCase())
        );
        observer.next(filtered);
      });
    });
  }

  // Buscar visitas
  searchVisits(query: string): Observable<PastoralVisit[]> {
    return new Observable((observer) => {
      this.visitsObservable$.subscribe((visits) => {
        const filtered = visits.filter(
          (v) =>
            v.memberName.toLowerCase().includes(query.toLowerCase()) ||
            v.pastor.toLowerCase().includes(query.toLowerCase()) ||
            v.subject.toLowerCase().includes(query.toLowerCase())
        );
        observer.next(filtered);
      });
    });
  }

  // ========== PALAVRA DO PASTOR (MENSAGENS DIÁRIAS) ==========

  getDailyMessages(): Observable<PastorDailyMessage[]> {
    return this.dailyMessagesObservable$;
  }

  getLatestDailyMessage(): Observable<PastorDailyMessage | undefined> {
    return this.dailyMessagesObservable$.pipe(
      map(
        (messages) =>
          messages
            .filter((m) => m.status === 'published')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      )
    );
  }

  getDailyMessageById(id: string): Observable<PastorDailyMessage | undefined> {
    return new Observable((observer) => {
      this.dailyMessagesObservable$.subscribe((messages) => {
        observer.next(messages.find((m) => m.id === id));
        observer.complete();
      });
    });
  }

  createDailyMessage(message: Omit<PastorDailyMessage, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newMessage: PastorDailyMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const current = this.dailyMessagesSubject.value;
    this.dailyMessagesSubject.next([...current, newMessage]);
  }

  updateDailyMessage(
    id: string,
    message: Partial<Omit<PastorDailyMessage, 'id' | 'createdAt'>>
  ): void {
    const current = this.dailyMessagesSubject.value;
    const updated = current.map((m) =>
      m.id === id ? { ...m, ...message, updatedAt: new Date() } : m
    );
    this.dailyMessagesSubject.next(updated);
  }

  deleteDailyMessage(id: string): void {
    const current = this.dailyMessagesSubject.value;
    const filtered = current.filter((m) => m.id !== id);
    this.dailyMessagesSubject.next(filtered);
  }

  publishDailyMessage(id: string): void {
    this.updateDailyMessage(id, { status: 'published' });
  }

  archiveDailyMessage(id: string): void {
    this.updateDailyMessage(id, { status: 'archived' });
  }

  searchDailyMessages(query: string): Observable<PastorDailyMessage[]> {
    return new Observable((observer) => {
      this.dailyMessagesObservable$.subscribe((messages) => {
        const filtered = messages.filter(
          (m) =>
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.message.toLowerCase().includes(query.toLowerCase()) ||
            m.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        );
        observer.next(filtered);
      });
    });
  }

  getRecentSermons(limit: number = 5): Observable<Sermon[]> {
    return this.sermonsObservable$.pipe(
      map((sermons) =>
        sermons
          .filter((s) => s.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit)
      )
    );
  }
}
