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
import { Observable, from, of, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Transaction, FinancialSummary } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class FinanceDatabaseService {
  private firestore: Firestore = inject(Firestore);
  private transactionsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.transactionsCollection = collection(this.firestore, 'transactions');
  }

  // Criar Transação
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.transactionsCollection, {
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  // Listar Transações em TEMPO REAL
  getTransactions(): Observable<Transaction[]> {
    return new Observable<Transaction[]>(observer => {
      const q = query(this.transactionsCollection, orderBy('date', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const transactions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data['date'] ? new Date(data['date']) : new Date(),
              createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
              updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
            } as Transaction;
          });
          
          observer.next(transactions);
        },
        (error) => {
          console.error('Erro ao buscar transações:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    }).pipe(
      catchError((error) => {
        console.error('Erro ao buscar transações:', error);
        return of<Transaction[]>([]);
      })
    );
  }

  // Obter Transação por ID
  getTransactionById(id: string): Observable<Transaction | undefined> {
    const docRef = doc(this.firestore, 'transactions', id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            date: data['date'] ? new Date(data['date']) : new Date(),
            createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
            updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
          } as Transaction;
        }
        return undefined;
      })
    );
  }

  // Atualizar Transação
  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    const docRef = doc(this.firestore, 'transactions', id);
    const updateData: any = {
      ...transaction,
      updatedAt: new Date().toISOString()
    };
    
    // Converter Date para ISO string
    if (transaction.date) {
      updateData.date = transaction.date.toISOString();
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    await updateDoc(docRef, updateData);
  }

  // Excluir Transação
  async deleteTransaction(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'transactions', id);
    await deleteDoc(docRef);
  }

  // Buscar transações por tipo
  getTransactionsByType(type: 'income' | 'expense'): Observable<Transaction[]> {
    return new Observable<Transaction[]>(observer => {
      const q = query(
        this.transactionsCollection, 
        where('type', '==', type),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date'] ? new Date(data['date']) : new Date(),
            createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
            updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
          } as Transaction;
        });
        observer.next(transactions);
      });

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<Transaction[]>([]))
    );
  }

  // Buscar transações por categoria
  getTransactionsByCategory(category: string): Observable<Transaction[]> {
    return new Observable<Transaction[]>(observer => {
      const q = query(
        this.transactionsCollection, 
        where('category', '==', category),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date'] ? new Date(data['date']) : new Date(),
            createdAt: data['createdAt'] ? new Date(data['createdAt']) : new Date(),
            updatedAt: data['updatedAt'] ? new Date(data['updatedAt']) : new Date()
          } as Transaction;
        });
        observer.next(transactions);
      });

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<Transaction[]>([]))
    );
  }

  // Contar total de receitas em TEMPO REAL
  getTotalIncome(): Observable<number> {
    return new Observable<number>(observer => {
      const q = query(
        this.transactionsCollection,
        where('type', '==', 'income'),
        where('status', '==', 'completed')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data['amount'] || 0);
        }, 0);
        observer.next(total);
      });

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Contar total de despesas em TEMPO REAL
  getTotalExpense(): Observable<number> {
    return new Observable<number>(observer => {
      const q = query(
        this.transactionsCollection,
        where('type', '==', 'expense'),
        where('status', '==', 'completed')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data['amount'] || 0);
        }, 0);
        observer.next(total);
      });

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Calcular saldo em TEMPO REAL
  getBalance(): Observable<number> {
    return combineLatest([
      this.getTotalIncome(),
      this.getTotalExpense()
    ]).pipe(
      map(([income, expense]) => income - expense)
    );
  }

  // Contar valor pendente em TEMPO REAL
  getPendingAmount(): Observable<number> {
    return new Observable<number>(observer => {
      const q = query(
        this.transactionsCollection,
        where('status', '==', 'pending')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data['amount'] || 0);
        }, 0);
        observer.next(total);
      });

      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Contar total de transações em TEMPO REAL
  getTransactionCount(): Observable<number> {
    return new Observable<number>(observer => {
      const unsubscribe = onSnapshot(
        this.transactionsCollection,
        (snapshot) => {
          observer.next(snapshot.size);
        }
      );
      return () => unsubscribe();
    }).pipe(
      catchError(() => of<number>(0))
    );
  }

  // Obter resumo financeiro em TEMPO REAL
  getFinancialSummary(): Observable<FinancialSummary> {
    return combineLatest([
      this.getTotalIncome(),
      this.getTotalExpense(),
      this.getPendingAmount(),
      this.getTransactionCount()
    ]).pipe(
      map(([totalIncome, totalExpense, pendingAmount, transactionCount]) => ({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        pendingAmount,
        transactionCount
      }))
    );
  }

  // Obter categorias disponíveis
  getCategories(): string[] {
    return [
      'Dízimo',
      'Ofertas',
      'Doações',
      'Aluguel',
      'Utilidades',
      'Manutenção',
      'Equipamentos',
      'Pessoal',
      'Missões',
      'Educação',
      'Eventos',
      'Outros',
    ];
  }

  // Obter métodos de pagamento disponíveis
  getPaymentMethods(): Array<{ value: string; label: string }> {
    return [
      { value: 'cash', label: 'Dinheiro' },
      { value: 'check', label: 'Cheque' },
      { value: 'transfer', label: 'Transferência' },
      { value: 'card', label: 'Cartão' },
      { value: 'other', label: 'Outro' },
    ];
  }
}
