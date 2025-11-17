import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, FinancialSummary } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([
    {
      id: '1',
      churchId: 'church-1',
      type: 'income',
      category: 'Dízimo',
      description: 'Dízimo do domingo 08/11',
      amount: 450.0,
      date: new Date(2025, 10, 8),
      paymentMethod: 'cash',
      status: 'completed',
      paidBy: 'Membros',
      notes: 'Coleta regular',
      createdAt: new Date(2025, 10, 8),
      updatedAt: new Date(2025, 10, 8),
      createdBy: 'Pastor João',
    },
    {
      id: '2',
      churchId: 'church-1',
      type: 'expense',
      category: 'Manutenção',
      description: 'Reparos no telhado',
      amount: 1200.0,
      date: new Date(2025, 10, 10),
      paymentMethod: 'transfer',
      status: 'completed',
      paidTo: 'Empresa de Construção XYZ',
      reference: 'NF-12345',
      notes: 'Reparo aprovado em reunião',
      createdAt: new Date(2025, 10, 10),
      updatedAt: new Date(2025, 10, 10),
      createdBy: 'Secretária Maria',
    },
    {
      id: '3',
      churchId: 'church-1',
      type: 'income',
      category: 'Ofertas',
      description: 'Oferta livre',
      amount: 320.0,
      date: new Date(2025, 10, 12),
      paymentMethod: 'cash',
      status: 'completed',
      paidBy: 'Fiéis',
      notes: 'Coleta de oferta especial',
      createdAt: new Date(2025, 10, 12),
      updatedAt: new Date(2025, 10, 12),
      createdBy: 'Pastor João',
    },
  ]);

  private transactionsObservable$ = this.transactionsSubject.asObservable();

  constructor() {}

  // Obter todas as transações
  getTransactions(): Observable<Transaction[]> {
    return this.transactionsObservable$;
  }

  // Obter transação por ID
  getTransaction(id: string): Transaction | undefined {
    return this.transactionsSubject.value.find((t) => t.id === id);
  }

  // Criar nova transação
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const current = this.transactionsSubject.value;
    this.transactionsSubject.next([...current, newTransaction]);
  }

  // Atualizar transação
  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const current = this.transactionsSubject.value;
    const updated = current.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    );
    this.transactionsSubject.next(updated);
  }

  // Deletar transação
  deleteTransaction(id: string): void {
    const current = this.transactionsSubject.value;
    this.transactionsSubject.next(current.filter((t) => t.id !== id));
  }

  // Buscar transações por tipo
  getTransactionsByType(type: 'income' | 'expense'): Observable<Transaction[]> {
    return new Observable((observer) => {
      this.transactionsObservable$.subscribe((transactions) => {
        observer.next(transactions.filter((t) => t.type === type));
      });
    });
  }

  // Buscar transações por categoria
  getTransactionsByCategory(category: string): Observable<Transaction[]> {
    return new Observable((observer) => {
      this.transactionsObservable$.subscribe((transactions) => {
        observer.next(transactions.filter((t) => t.category === category));
      });
    });
  }

  // Buscar transações por período
  getTransactionsByDateRange(startDate: Date, endDate: Date): Observable<Transaction[]> {
    return new Observable((observer) => {
      this.transactionsObservable$.subscribe((transactions) => {
        observer.next(transactions.filter((t) => t.date >= startDate && t.date <= endDate));
      });
    });
  }

  // Calcular resumo financeiro
  getFinancialSummary(): Observable<FinancialSummary> {
    return new Observable((observer) => {
      this.transactionsObservable$.subscribe((transactions) => {
        const totalIncome = transactions
          .filter((t) => t.type === 'income' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
          .filter((t) => t.type === 'expense' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingAmount = transactions
          .filter((t) => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        observer.next({
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: transactions.length,
          pendingAmount,
        });
      });
    });
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

  // Buscar transações com filtros
  searchTransactions(query: string): Observable<Transaction[]> {
    return new Observable((observer) => {
      this.transactionsObservable$.subscribe((transactions) => {
        const filtered = transactions.filter(
          (t) =>
            t.description.toLowerCase().includes(query.toLowerCase()) ||
            t.category.toLowerCase().includes(query.toLowerCase()) ||
            t.paidBy?.toLowerCase().includes(query.toLowerCase()) ||
            t.paidTo?.toLowerCase().includes(query.toLowerCase())
        );
        observer.next(filtered);
      });
    });
  }
}
