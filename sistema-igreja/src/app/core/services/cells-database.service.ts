import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
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
import { Cell } from '../../shared/models/cell.model';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class CellsDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
  private cellsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.cellsCollection = collection(this.firestore, 'cells');
  }

  // Criar Célula
  async addCell(cell: Omit<Cell, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.cellsCollection, {
      ...cell,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log de auditoria (executa em background)
    this.logAuditAction('CREATE', docRef.id, cell.name, `Nova célula criada: ${cell.name}`);
    
    return docRef.id;
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
            module: 'cells',
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

  // Listar Células em TEMPO REAL
  getCells(): Observable<Cell[]> {
    return new Observable<Cell[]>(observer => {
      const unsubscribe = onSnapshot(
        this.cellsCollection,
        (snapshot) => {
          const cells = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Garantir que datas sejam convertidas corretamente se necessário
              createdAt: data['createdAt'],
              updatedAt: data['updatedAt']
            } as Cell;
          });
          
          observer.next(cells);
        },
        (error) => {
          console.error('Erro ao buscar células:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar células:', error);
        return of<Cell[]>([]);
      })
    );
  }

  // Obter Célula por ID
  getCellById(id: string): Observable<Cell | undefined> {
    const docRef = doc(this.firestore, 'cells', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Cell;
        }
        return undefined;
      })
    );
  }

  // Atualizar Célula
  async updateCell(id: string, cell: Partial<Cell>): Promise<void> {
    const docRef = doc(this.firestore, 'cells', id);
    const updateData = {
      ...cell,
      updatedAt: new Date().toISOString()
    };
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria (executa em background)
    // Para update, idealmente buscaríamos o dado anterior, mas para simplificar e não bloquear,
    // vamos logar apenas a ação de atualização com os dados novos
    this.logAuditAction('UPDATE', id, cell.name || 'Célula', `Célula atualizada: ${cell.name || id}`);
  }

  // Excluir Célula
  async deleteCell(id: string): Promise<void> {
    // Buscar dados antes de excluir para o log
    const docRef = doc(this.firestore, 'cells', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria (executa em background)
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['name'], `Célula excluída: ${beforeData['name']}`);
    }
  }

  // Contar células ativas (para dashboard)
  getActiveCellsCount(): Observable<number> {
    return this.getCells().pipe(
      map(cells => cells.length) // Por enquanto conta todas, depois podemos filtrar por status
    );
  }
}
