import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentData,
  onSnapshot,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Testimony } from '../../shared/models/testimony.model';

@Injectable({
  providedIn: 'root',
})
export class TestimoniesDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private testimoniesCollection: CollectionReference<DocumentData>;

  constructor() {
    this.testimoniesCollection = collection(this.firestore, 'testimonies');
  }

  // Criar Testemunho
  async addTestimony(testimony: Omit<Testimony, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.testimoniesCollection, {
      ...testimony,
      isApproved: false, // Por padrão não aprovado
      isPublic: false, // Por padrão não público
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  // Listar Todos os Testemunhos (Dashboard)
  getTestimonies(): Observable<Testimony[]> {
    return new Observable<Testimony[]>(observer => {
      const q = query(this.testimoniesCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const testimonies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Testimony));
          observer.next(testimonies);
        },
        (error) => {
          console.error('Erro ao buscar testemunhos:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar testemunhos:', error);
        return of<Testimony[]>([]);
      })
    );
  }

  // Listar Testemunhos Aprovados e Públicos (Site Público)
  getPublicTestimonies(): Observable<Testimony[]> {
    return new Observable<Testimony[]>(observer => {
      const q = query(
        this.testimoniesCollection, 
        where('isApproved', '==', true),
        where('isPublic', '==', true)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const testimonies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Testimony))
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Mais recentes primeiro
          });
          observer.next(testimonies);
        },
        (error) => {
          console.error('Erro ao buscar testemunhos públicos:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar testemunhos públicos:', error);
        return of<Testimony[]>([]);
      })
    );
  }

  // Atualizar Testemunho
  async updateTestimony(id: string, testimony: Partial<Testimony>): Promise<void> {
    const docRef = doc(this.firestore, 'testimonies', id);
    await updateDoc(docRef, {
      ...testimony,
      updatedAt: new Date().toISOString()
    });
  }

  // Deletar Testemunho
  async deleteTestimony(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'testimonies', id);
    await deleteDoc(docRef);
  }

  // Aprovar Testemunho
  async approveTestimony(id: string): Promise<void> {
    await this.updateTestimony(id, { isApproved: true, isPublic: true });
  }

  // Rejeitar/Ocultar Testemunho
  async rejectTestimony(id: string): Promise<void> {
    await this.updateTestimony(id, { isApproved: false, isPublic: false });
  }
}
