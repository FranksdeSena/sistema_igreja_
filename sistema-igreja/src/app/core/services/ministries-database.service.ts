import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  CollectionReference,
  DocumentData,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Ministry, ServiceSchedule } from '../../shared/models/ministry.model';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class MinistriesDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
  private ministriesCollection: CollectionReference<DocumentData>;
  private schedulesCollection: CollectionReference<DocumentData>;

  constructor() {
    this.ministriesCollection = collection(this.firestore, 'ministries');
    this.schedulesCollection = collection(this.firestore, 'service_schedules');
  }

  // ==================== MINISTÉRIOS ====================

  // Criar Ministério
  async addMinistry(ministry: Omit<Ministry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.ministriesCollection, {
      ...ministry,
      volunteerIds: ministry.volunteerIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log de auditoria (executa em background)
    this.logAuditAction('CREATE', docRef.id, ministry.name, `Novo ministério criado: ${ministry.name}`);
    
    return docRef.id;
  }

  // Listar Ministérios em TEMPO REAL
  getMinistries(): Observable<Ministry[]> {
    return new Observable<Ministry[]>(observer => {
      const unsubscribe = onSnapshot(
        this.ministriesCollection,
        (snapshot) => {
          const ministries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Ministry));
          observer.next(ministries);
        },
        (error) => {
          console.error('Erro ao buscar ministérios:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar ministérios:', error);
        return of<Ministry[]>([]);
      })
    );
  }

  // Obter Ministério por ID
  getMinistryById(id: string): Observable<Ministry | undefined> {
    const docRef = doc(this.firestore, 'ministries', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Ministry;
        }
        return undefined;
      })
    );
  }

  // Atualizar Ministério
  async updateMinistry(id: string, ministry: Partial<Ministry>): Promise<void> {
    const docRef = doc(this.firestore, 'ministries', id);
    const updateData = {
      ...ministry,
      updatedAt: new Date().toISOString()
    };
    
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria (executa em background)
    this.logAuditAction('UPDATE', id, ministry.name || 'Ministério', `Ministério atualizado: ${ministry.name || id}`);
  }

  // Excluir Ministério
  async deleteMinistry(id: string): Promise<void> {
    // Buscar dados antes de excluir para o log
    const docRef = doc(this.firestore, 'ministries', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria (executa em background)
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['name'], `Ministério excluído: ${beforeData['name']}`);
    }
  }

  // ==================== ESCALAS DE SERVIÇO ====================

  // Criar Escala
  async addSchedule(schedule: Omit<ServiceSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.schedulesCollection, {
      ...schedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log de auditoria (executa em background)
    // Log de auditoria (executa em background)
    this.logAuditAction('CREATE', docRef.id, schedule.ministryName, `Nova escala criada para ${schedule.ministryName} em ${new Date(schedule.date).toLocaleDateString()}`);
    
    return docRef.id;
  }

  // Listar Escalas em TEMPO REAL
  getSchedules(): Observable<ServiceSchedule[]> {
    return new Observable<ServiceSchedule[]>(observer => {
      const unsubscribe = onSnapshot(
        this.schedulesCollection,
        (snapshot) => {
          const schedules = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ServiceSchedule));
          observer.next(schedules);
        },
        (error) => {
          console.error('Erro ao buscar escalas:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar escalas:', error);
        return of<ServiceSchedule[]>([]);
      })
    );
  }

  // Obter Escala por ID
  getScheduleById(id: string): Observable<ServiceSchedule | undefined> {
    const docRef = doc(this.firestore, 'service_schedules', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as ServiceSchedule;
        }
        return undefined;
      })
    );
  }

  // Atualizar Escala
  async updateSchedule(id: string, schedule: Partial<ServiceSchedule>): Promise<void> {
    const docRef = doc(this.firestore, 'service_schedules', id);
    const updateData = {
      ...schedule,
      updatedAt: new Date().toISOString()
    };
    
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria (executa em background)
    // Log de auditoria (executa em background)
    this.logAuditAction('UPDATE', id, schedule.ministryName || 'Escala', `Escala atualizada: ${schedule.ministryName || id}`);
  }

  // Excluir Escala
  async deleteSchedule(id: string): Promise<void> {
    // Buscar dados antes de excluir para o log
    const docRef = doc(this.firestore, 'service_schedules', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria (executa em background)
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['ministryName'], `Escala excluída: ${beforeData['ministryName']} - ${new Date(beforeData['date']).toLocaleDateString()}`);
    }
  }

  // Método auxiliar para registrar auditoria de forma assíncrona
  private logAuditAction(action: 'CREATE' | 'UPDATE' | 'DELETE', entityId: string, entityName: string, description: string): void {
    // Executa de forma assíncrona sem bloquear
    firstValueFrom(this.authService.currentUser$)
      .then(currentUser => {
        if (currentUser) {
          this.auditService.logAction({
            userId: currentUser.id,
            userName: currentUser.full_name,
            userEmail: currentUser.email,
            action,
            module: 'ministries',
            entityId,
            entityName,
            description
          });
        }
      })
      .catch(error => {
        console.error('Erro ao registrar log de auditoria:', error);
      });
  }

  // ==================== MÉTODOS AUXILIARES ====================

  // Categorias de Ministérios
  getCategories(): string[] {
    return [
      'Louvor e Adoração',
      'Mídia e Tecnologia',
      'Infantil',
      'Intercessão',
      'Recepção',
      'Limpeza e Organização',
      'Ensino',
      'Evangelismo',
      'Outros'
    ];
  }
}
