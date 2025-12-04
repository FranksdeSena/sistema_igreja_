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
  setDoc,
  CollectionReference,
  DocumentData,
  onSnapshot
} from '@angular/fire/firestore';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Member } from '../../shared/models';
import { AuditService } from './audit.service';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({
  providedIn: 'root',
})
export class MembersDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private auditService = inject(AuditService);
  private authService = inject(FirebaseAuthService);
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
    
    // Log de auditoria (executa em background, não bloqueia a operação)
    this.logAuditAction('CREATE', docRef.id, member.name, `Novo membro cadastrado: ${member.name}`);
    
    // Sincronizar com coleção pública se for líder
    this.syncPublicLeader(docRef.id, member).catch(err => console.error('Erro ao sincronizar líder público:', err));

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
            module: 'members',
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
              birthDate: this.parseDate(data['birthDate']),
              joinDate: this.parseDate(data['joinDate']) || new Date(),
              createdAt: this.parseDate(data['createdAt']) || new Date(),
              updatedAt: this.parseDate(data['updatedAt']) || new Date()
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
            birthDate: this.parseDate(data['birthDate']),
            joinDate: this.parseDate(data['joinDate']) || new Date(),
            createdAt: this.parseDate(data['createdAt']) || new Date(),
            updatedAt: this.parseDate(data['updatedAt']) || new Date()
          } as Member;
        }
        return undefined;
      })
    );
  }

  // Helper para converter datas do Firestore (Timestamp, String ou Date)
  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;
    
    // Se for Timestamp do Firestore
    if (value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    // Se for string ou number
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return undefined;
  }

  // Atualizar Membro
  async updateMember(id: string, member: Partial<Member>): Promise<void> {
    // Buscar dados anteriores para o log
    const docRef = doc(this.firestore, 'members', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    const updateData = {
      ...member,
      updatedAt: new Date().toISOString()
    };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);
    
    await updateDoc(docRef, updateData);
    
    // Log de auditoria (executa em background)
    if (beforeData) {
      this.logAuditAction('UPDATE', id, member.name || beforeData['name'], `Membro atualizado: ${member.name || beforeData['name']}`);
    }

    // Sincronizar com coleção pública se for líder
    // Precisamos mesclar os dados novos com os antigos para ter o objeto completo (ex: role pode não ter mudado)
    if (beforeData) {
      const mergedData = { ...beforeData, ...member };
      this.syncPublicLeader(id, mergedData).catch(err => console.error('Erro ao sincronizar líder público:', err));
    }
  }

  // Excluir Membro
  async deleteMember(id: string): Promise<void> {
    // Buscar dados antes de excluir para o log
    const docRef = doc(this.firestore, 'members', id);
    const beforeDoc = await getDoc(docRef);
    const beforeData = beforeDoc.exists() ? beforeDoc.data() : null;
    
    await deleteDoc(docRef);
    
    // Log de auditoria (executa em background)
    if (beforeData) {
      this.logAuditAction('DELETE', id, beforeData['name'], `Membro excluído: ${beforeData['name']}`);
    }

    // Remover da coleção pública
    this.syncPublicLeader(id, null).catch(err => console.error('Erro ao remover líder público:', err));
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
  // Buscar aniversariantes do mês
  getBirthdaysThisMonth(): Observable<Member[]> {
    return this.getMembers().pipe(
      map(members => {
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        
        return members
          .filter(member => {
            if (!member.birthDate) return false;
            
            // Converter para Date
            const birthDate = new Date(member.birthDate);
            
            // Usar UTC para evitar problemas de fuso horário
            const isoString = birthDate.toISOString();
            const month = parseInt(isoString.substring(5, 7)) - 1; // 0-indexed
            
            return month === currentMonth;
          })
          .sort((a, b) => {
            const dateA = new Date(a.birthDate!);
            const dateB = new Date(b.birthDate!);
            return dateA.getUTCDate() - dateB.getUTCDate();
          });
      })
    );
  }

  // MÉTODO DE CORREÇÃO: Corrigir data corrompida de membro específico
  async fixCorruptedBirthDate(memberId: string, correctDate: Date): Promise<void> {
    const memberDoc = doc(this.firestore, 'members', memberId);
    await updateDoc(memberDoc, {
      birthDate: correctDate.toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Sincroniza dados públicos de líderes (Pastores/Intercessão)
   * para a coleção 'public_leaders' que tem leitura liberada
   */
  private async syncPublicLeader(memberId: string, memberData: Partial<Member> | null): Promise<void> {
    const publicDocRef = doc(this.firestore, 'public_leaders', memberId);

    // Se memberData for null, significa exclusão
    if (!memberData) {
      await deleteDoc(publicDocRef);
      return;
    }

    const role = memberData.role?.toLowerCase() || '';
    const isLeader = role.includes('pastor') || role.includes('intercessão') || role.includes('intercessao') || role.includes('oração');

    if (isLeader) {
      // É líder: Atualizar ou Criar na coleção pública
      // Apenas dados seguros
      const publicData = {
        id: memberId,
        name: memberData.name,
        role: memberData.role,
        photo: memberData.photo || null,
        email: memberData.email || null, // Opcional, mas útil para contato
        gender: memberData.gender || null,
        updatedAt: new Date().toISOString()
      };
      
      // Remove campos undefined/null se necessário, mas Firestore aceita null
      await setDoc(publicDocRef, publicData, { merge: true });
    } else {
      // Não é líder (ou deixou de ser): Remover da coleção pública
      await deleteDoc(publicDocRef);
    }
  }

  // Buscar Líderes Públicos (para o site)
  getPublicLeaders(): Observable<Member[]> {
    const publicCollection = collection(this.firestore, 'public_leaders');
    return new Observable<Member[]>(observer => {
      const unsubscribe = onSnapshot(
        publicCollection,
        (snapshot) => {
          const leaders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Datas podem vir como string ou Timestamp
              updatedAt: this.parseDate(data['updatedAt']) || new Date()
            } as Member;
          });
          observer.next(leaders);
        },
        (error) => {
          console.error('Erro ao buscar líderes públicos:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError(() => of<Member[]>([]))
    );
  }

  /**
   * Migração inicial: Sincroniza todos os líderes existentes para public_leaders
   * Este método deve ser executado UMA VEZ após a implementação da feature
   */
  async migrateLeadersToPublic(): Promise<{ success: number; errors: number }> {
    const snapshot = await getDocs(this.membersCollection);
    let success = 0;
    let errors = 0;

    for (const docSnap of snapshot.docs) {
      try {
        const member = {
          id: docSnap.id,
          ...docSnap.data()
        } as Member;

        // Sincronizar se for líder
        await this.syncPublicLeader(member.id, member);
        success++;
      } catch (error) {
        console.error(`Erro ao migrar membro ${docSnap.id}:`, error);
        errors++;
      }
    }

    console.log(`Migração concluída: ${success} membros processados, ${errors} erros`);
    return { success, errors };
  }
}
