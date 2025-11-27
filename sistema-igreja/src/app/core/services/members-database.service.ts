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
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Member } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class MembersDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private membersCollection: CollectionReference<DocumentData>;

  constructor() {
    this.membersCollection = collection(this.firestore, 'members');
  }

  // Criar Membro
  async addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.membersCollection, {
      ...member,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  // Listar Membros em TEMPO REAL (usando onSnapshot)
  getMembers(): Observable<Member[]> {
    return new Observable<Member[]>(observer => {
      const unsubscribe = onSnapshot(
        this.membersCollection,
        (snapshot) => {
          const members = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              birthDate: data['birthDate'] ? new Date(data['birthDate']) : undefined,
              joinDate: data['joinDate'] ? new Date(data['joinDate']) : new Date(),
              createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
              updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
            } as Member;
          });
          
          observer.next(members);
        },
        (error) => {
          console.error('Erro ao buscar membros:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar membros:', error);
        return of<Member[]>([]);
      })
    );
  }

  // Contar membros ativos em TEMPO REAL
  getActiveMembersCount(): Observable<number> {
    const q = query(this.membersCollection, where('status', '==', 'active'));
    
    return new Observable<number>(observer => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          observer.next(snapshot.size);
        },
        (error) => {
          console.error('Erro ao contar membros ativos:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Contar total de membros em TEMPO REAL
  getTotalMembersCount(): Observable<number> {
    return new Observable<number>(observer => {
      const unsubscribe = onSnapshot(
        this.membersCollection,
        (snapshot) => {
          observer.next(snapshot.size);
        },
        (error) => {
          console.error('Erro ao contar membros:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Obter Membro por ID
  getMemberById(id: string): Observable<Member | undefined> {
    const docRef = doc(this.firestore, 'members', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            birthDate: data['birthDate'] ? new Date(data['birthDate']) : undefined,
            joinDate: data['joinDate'] ? new Date(data['joinDate']) : new Date(),
            createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
            updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
          } as Member;
        }
        return undefined;
      })
    );
  }

  // Atualizar Membro
  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    const docRef = doc(this.firestore, 'members', id);
    const updateData = {
      ...member,
      updatedAt: new Date().toISOString()
    };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);
    
    await updateDoc(docRef, updateData);
  }

  // Excluir Membro
  async deleteMember(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'members', id);
    await deleteDoc(docRef);
  }

  // Buscar Membros (filtro simples local por enquanto, idealmente seria no banco)
  searchMembers(term: string): Observable<Member[]> {
    return this.getMembers().pipe(
      map(members => members.filter(m => 
        m.name.toLowerCase().includes(term.toLowerCase()) ||
        m.email.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }
}
