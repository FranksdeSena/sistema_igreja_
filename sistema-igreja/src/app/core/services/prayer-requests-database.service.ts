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
import { PrayerRequest } from '../../shared/models/prayer-request.model';

@Injectable({
  providedIn: 'root',
})
export class PrayerRequestsDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private prayerRequestsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.prayerRequestsCollection = collection(this.firestore, 'prayer_requests');
  }

  // Criar Pedido de Oração (Público)
  async addPrayerRequest(request: Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt' | 'isApproved' | 'isPublic' | 'isPrayed'>): Promise<string> {
    const docRef = await addDoc(this.prayerRequestsCollection, {
      ...request,
      isApproved: false,
      isPublic: false,
      isPrayed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  // Listar Todos os Pedidos (Dashboard)
  getPrayerRequests(): Observable<PrayerRequest[]> {
    return new Observable<PrayerRequest[]>(observer => {
      const q = query(this.prayerRequestsCollection, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PrayerRequest));
          observer.next(requests);
        },
        (error) => {
          console.error('Erro ao buscar pedidos de oração:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar pedidos de oração:', error);
        return of<PrayerRequest[]>([]);
      })
    );
  }

  // Listar Pedidos Públicos (Site)
  getPublicPrayerRequests(): Observable<PrayerRequest[]> {
    return new Observable<PrayerRequest[]>(observer => {
      const q = query(
        this.prayerRequestsCollection, 
        where('isApproved', '==', true),
        where('isPublic', '==', true)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as PrayerRequest))
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          observer.next(requests);
        },
        (error) => {
          console.error('Erro ao buscar pedidos públicos:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar pedidos públicos:', error);
        return of<PrayerRequest[]>([]);
      })
    );
  }

  // Atualizar Pedido
  async updatePrayerRequest(id: string, request: Partial<PrayerRequest>): Promise<void> {
    const docRef = doc(this.firestore, 'prayer_requests', id);
    await updateDoc(docRef, {
      ...request,
      updatedAt: new Date().toISOString()
    });
  }

  // Deletar Pedido
  async deletePrayerRequest(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'prayer_requests', id);
    await deleteDoc(docRef);
  }

  // Aprovar Pedido
  async approvePrayerRequest(id: string, makePublic: boolean = false): Promise<void> {
    await this.updatePrayerRequest(id, { isApproved: true, isPublic: makePublic });
  }

  // Marcar como Orado
  async markAsPrayed(id: string): Promise<void> {
    await this.updatePrayerRequest(id, { isPrayed: true });
  }
}
