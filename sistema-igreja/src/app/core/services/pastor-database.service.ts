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
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PastorWord, Sermon } from '../../shared/models/pastor.model';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class PastorDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
  
  private wordsCollection: CollectionReference<DocumentData>;
  private sermonsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.wordsCollection = collection(this.firestore, 'pastor_words');
    this.sermonsCollection = collection(this.firestore, 'sermons');
  }

  // ==================== PALAVRA DO PASTOR ====================

  // Criar Palavra
  async addWord(word: Omit<PastorWord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Se a nova palavra for ativa, desativar as outras primeiro
    if (word.isActive) {
      await this.deactivateAllWords();
    }

    const docRef = await addDoc(this.wordsCollection, {
      ...word,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log de auditoria
    this.logAuditAction('CREATE', docRef.id, word.title, `Nova Palavra do Pastor criada: ${word.title}`);
    
    return docRef.id;
  }

  // Listar Palavras em TEMPO REAL
  getWords(): Observable<PastorWord[]> {
    return new Observable<PastorWord[]>(observer => {
      const q = query(this.wordsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const words = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PastorWord));
          observer.next(words);
        },
        (error) => {
          console.error('Erro ao buscar palavras:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar palavras:', error);
        return of<PastorWord[]>([]);
      })
    );
  }

  // Obter Palavra Ativa (para Dashboard)
  getActiveWord(): Observable<PastorWord | undefined> {
    return new Observable<PastorWord | undefined>(observer => {
      const q = query(this.wordsCollection, where('isActive', '==', true), limit(1));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            observer.next({
              id: doc.id,
              ...doc.data()
            } as PastorWord);
          } else {
            observer.next(undefined);
          }
        },
        (error) => {
          console.error('Erro ao buscar palavra ativa:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  // Atualizar Palavra
  async updateWord(id: string, word: Partial<PastorWord>): Promise<void> {
    // Se estiver ativando esta palavra, desativar as outras
    if (word.isActive) {
      await this.deactivateAllWords(id);
    }

    const docRef = doc(this.firestore, 'pastor_words', id);
    const updateData = {
      ...word,
      updatedAt: new Date().toISOString()
    };
    
    // Remover campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria
    this.logAuditAction('UPDATE', id, word.title || 'Palavra', `Palavra do Pastor atualizada: ${word.title || id}`);
  }

  // Excluir Palavra
  async deleteWord(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'pastor_words', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['title'], `Palavra do Pastor excluída: ${beforeData['title']}`);
    }
  }

  // Auxiliar: Desativar todas as palavras (exceto uma opcional)
  private async deactivateAllWords(excludeId?: string): Promise<void> {
    const q = query(this.wordsCollection, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    const batchPromises = snapshot.docs.map(docSnapshot => {
      if (docSnapshot.id !== excludeId) {
        return updateDoc(docSnapshot.ref, { isActive: false });
      }
      return Promise.resolve();
    });
    
    await Promise.all(batchPromises);
  }

  // ==================== SERMÕES ====================

  // Criar Sermão
  async addSermon(sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.sermonsCollection, {
      ...sermon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log de auditoria
    this.logAuditAction('CREATE', docRef.id, sermon.title, `Novo sermão criado: ${sermon.title}`);
    
    return docRef.id;
  }

  // Listar Sermões em TEMPO REAL
  getSermons(): Observable<Sermon[]> {
    return new Observable<Sermon[]>(observer => {
      const q = query(this.sermonsCollection, orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const sermons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Sermon));
          observer.next(sermons);
        },
        (error) => {
          console.error('Erro ao buscar sermões:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar sermões:', error);
        return of<Sermon[]>([]);
      })
    );
  }

  // Listar Sermões Recentes (com limite)
  getRecentSermons(limitCount: number = 5): Observable<Sermon[]> {
    return new Observable<Sermon[]>(observer => {
      const q = query(this.sermonsCollection, orderBy('date', 'desc'), limit(limitCount));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const sermons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Sermon));
          observer.next(sermons);
        },
        (error) => {
          console.error('Erro ao buscar sermões recentes:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar sermões recentes:', error);
        return of<Sermon[]>([]);
      })
    );
  }

  // Obter Sermão por ID
  getSermonById(id: string): Observable<Sermon | undefined> {
    const docRef = doc(this.firestore, 'sermons', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Sermon;
        }
        return undefined;
      })
    );
  }

  // Atualizar Sermão
  async updateSermon(id: string, sermon: Partial<Sermon>): Promise<void> {
    const docRef = doc(this.firestore, 'sermons', id);
    const updateData = {
      ...sermon,
      updatedAt: new Date().toISOString()
    };
    
    Object.keys(updateData).forEach(key => 
      updateData[key as keyof typeof updateData] === undefined && 
      delete updateData[key as keyof typeof updateData]
    );
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria
    this.logAuditAction('UPDATE', id, sermon.title || 'Sermão', `Sermão atualizado: ${sermon.title || id}`);
  }

  // Excluir Sermão
  async deleteSermon(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'sermons', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['title'], `Sermão excluído: ${beforeData['title']}`);
    }
  }

  // ==================== AUXILIARES ====================

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
            module: 'pastor',
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
}
