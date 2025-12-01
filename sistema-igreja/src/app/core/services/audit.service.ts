import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  CollectionReference,
  DocumentData,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditLog, AuditLogFilters } from '../../shared/models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private firestore: Firestore = inject(Firestore);
  private auditLogsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.auditLogsCollection = collection(this.firestore, 'audit_logs');
  }

  /**
   * Registrar uma ação no log de auditoria
   */
  async logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      console.log('🔍 Tentando registrar log de auditoria:', log);
      const docRef = await addDoc(this.auditLogsCollection, {
        ...log,
        timestamp: new Date().toISOString()
      });
      console.log('✅ Log registrado com sucesso! ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
      // Não lançar erro para não quebrar a operação principal
    }
  }

  /**
   * Buscar logs com filtros
   */
  getLogs(filters?: AuditLogFilters, maxResults: number = 100): Observable<AuditLog[]> {
    return from(this.fetchLogs(filters, maxResults));
  }

  private async fetchLogs(filters?: AuditLogFilters, maxResults: number = 100): Promise<AuditLog[]> {
    try {
      let q = query(
        this.auditLogsCollection,
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );

      // Aplicar filtros
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters?.module) {
        q = query(q, where('module', '==', filters.module));
      }
      if (filters?.action) {
        q = query(q, where('action', '==', filters.action));
      }

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AuditLog));

      // Filtrar por data (client-side, pois Firestore não suporta range queries com orderBy em campo diferente)
      if (filters?.startDate || filters?.endDate) {
        return logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (filters.startDate && logDate < new Date(filters.startDate)) return false;
          if (filters.endDate && logDate > new Date(filters.endDate)) return false;
          return true;
        });
      }

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      return [];
    }
  }

  /**
   * Buscar logs de um usuário específico
   */
  getLogsByUser(userId: string, maxResults: number = 50): Observable<AuditLog[]> {
    return this.getLogs({ userId }, maxResults);
  }

  /**
   * Buscar logs de um módulo específico
   */
  getLogsByModule(module: AuditLog['module'], maxResults: number = 50): Observable<AuditLog[]> {
    return this.getLogs({ module }, maxResults);
  }

  /**
   * Buscar logs por período
   */
  getLogsByDateRange(startDate: string, endDate: string, maxResults: number = 100): Observable<AuditLog[]> {
    return this.getLogs({ startDate, endDate }, maxResults);
  }

  /**
   * Exportar logs para CSV
   */
  exportToCSV(logs: AuditLog[]): string {
    const headers = ['Data/Hora', 'Usuário', 'Email', 'Ação', 'Módulo', 'Entidade', 'Descrição'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString('pt-BR'),
      log.userName,
      log.userEmail,
      log.action,
      log.module,
      log.entityName || '-',
      log.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Download CSV
   */
  downloadCSV(logs: AuditLog[], filename: string = 'auditoria.csv'): void {
    const csv = this.exportToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Obter módulos disponíveis
   */
  getModules(): string[] {
    return ['members', 'finance', 'events', 'cells', 'ministries', 'users', 'auth'];
  }

  /**
   * Obter ações disponíveis
   */
  getActions(): string[] {
    return ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  }
}
