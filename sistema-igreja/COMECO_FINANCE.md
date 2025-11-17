# 🚀 Início da Implementação - Módulo Finance

## 📋 Próximas Ações

Este documento orienta como começar o módulo Finance seguindo o Design System.

---

## ✅ Checklist Pré-Implementação

- [x] Design System criado (DESIGN_SYSTEM.md)
- [x] Plano de implementação (PLANO_IMPLEMENTACAO.md)
- [x] Guia Mobile-First (MOBILE_FIRST_GUIDE.md)
- [ ] Começar Módulo Finance
- [ ] Testar Módulo Finance
- [ ] Começar Módulo Events
- [ ] Começar Módulo Pastor
- [ ] Começar Módulo Secretaria
- [ ] Implementar Testes
- [ ] Integração Supabase
- [ ] Deploy

---

## 🏗️ Estrutura do Módulo Finance

```
src/app/modules/finance/
├── finance.component.ts          (Listagem principal)
├── finance-form.component.ts     (Criar/Editar)
├── finance-report.component.ts   (Relatório - Novo)
├── finance.service.ts            (CRUD)
├── finance-layout.component.ts   (Layout wrapper)
├── finance.routes.ts             (Rotas)
└── finance.model.ts              (Interfaces)
```

---

## 📝 Instruções de Implementação

### Passo 1: Criar Model (finance.model.ts)

**Arquivo**: `src/app/shared/models/finance.model.ts`

```typescript
export type TransactionType = 'tithe' | 'offering' | 'expense' | 'donation';
export type PaymentMethod = 'cash' | 'check' | 'pix' | 'transfer' | 'other';
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Transaction {
  id: string;
  churchId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  memberId?: string;
  category: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  tithes: number;
  offerings: number;
  period: string; // 'month' ou 'year'
}
```

---

### Passo 2: Criar Service (finance.service.ts)

**Arquivo**: `src/app/core/services/finance.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Transaction, FinancialSummary } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  // Mock data inicial
  private mockTransactions: Transaction[] = [
    {
      id: 'trans-1',
      churchId: 'church-1',
      type: 'tithe',
      amount: 500,
      description: 'Dízimo - Maria Silva',
      date: new Date('2025-11-10'),
      memberId: 'member-1',
      category: 'Dízimo',
      paymentMethod: 'pix',
      status: 'confirmed',
      notes: '',
      createdAt: new Date('2025-11-10'),
      updatedAt: new Date('2025-11-10'),
    },
    {
      id: 'trans-2',
      churchId: 'church-1',
      type: 'offering',
      amount: 150,
      description: 'Oferta - Projetos Sociais',
      date: new Date('2025-11-12'),
      category: 'Oferta',
      paymentMethod: 'cash',
      status: 'confirmed',
      createdAt: new Date('2025-11-12'),
      updatedAt: new Date('2025-11-12'),
    },
    {
      id: 'trans-3',
      churchId: 'church-1',
      type: 'expense',
      amount: -200,
      description: 'Aluguel do salão',
      date: new Date('2025-11-15'),
      category: 'Despesa Operacional',
      paymentMethod: 'transfer',
      status: 'pending',
      notes: 'Vencer dia 20',
      createdAt: new Date('2025-11-15'),
      updatedAt: new Date('2025-11-15'),
    },
  ];

  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.mockTransactions);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor() {}

  // Implementar métodos CRUD
  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return of(this.mockTransactions.find((t) => t.id === id));
  }

  addTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockTransactions.push(newTransaction);
    this.transactionsSubject.next([...this.mockTransactions]);
    return of(newTransaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction | null> {
    const index = this.mockTransactions.findIndex((t) => t.id === id);
    if (index === -1) return of(null);

    const updated = {
      ...this.mockTransactions[index],
      ...transaction,
      updatedAt: new Date(),
    };
    this.mockTransactions[index] = updated;
    this.transactionsSubject.next([...this.mockTransactions]);
    return of(updated);
  }

  deleteTransaction(id: string): Observable<void> {
    this.mockTransactions = this.mockTransactions.filter((t) => t.id !== id);
    this.transactionsSubject.next([...this.mockTransactions]);
    return of(void 0);
  }

  searchTransactions(query: string): Observable<Transaction[]> {
    return of(
      this.mockTransactions.filter(
        (t) =>
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  getFinancialSummary(month?: Date): Observable<FinancialSummary> {
    const income = this.mockTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = Math.abs(
      this.mockTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    );

    const tithes = this.mockTransactions
      .filter((t) => t.type === 'tithe')
      .reduce((sum, t) => sum + t.amount, 0);

    const offerings = this.mockTransactions
      .filter((t) => t.type === 'offering')
      .reduce((sum, t) => sum + t.amount, 0);

    return of({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      tithes,
      offerings,
      period: new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      }),
    });
  }
}
```

---

### Passo 3: Criar Componentes

#### finance.component.ts

- Listagem com tabela/cards
- Stats cards
- Busca e filtros
- Botão "Nova Transação"

#### finance-form.component.ts

- Formulário para criar/editar
- Validações
- Seleção de tipo/método

#### finance-report.component.ts (Novo)

- Gráfico de receita/despesa
- Totais mensais
- Download CSV

#### finance-layout.component.ts

- Wrapper com DashboardLayoutComponent

---

### Passo 4: Criar Rotas (finance.routes.ts)

---

## 🎯 Começar Agora

Para iniciar, responda com "**sim**" e farei:

1. ✅ Criar o arquivo `finance.model.ts`
2. ✅ Criar o arquivo `finance.service.ts`
3. ✅ Criar `finance.component.ts` (listagem)
4. ✅ Criar `finance-form.component.ts` (formulário)
5. ✅ Criar `finance.routes.ts`
6. ✅ Adicionar ao menu sidebar

Tudo seguindo:

- ✅ Design System definido
- ✅ Padrões de cores/tipografia
- ✅ Mobile-first responsivo
- ✅ Estrutura consistente com Members

---

**Status**: 🟢 Pronto para começar Finance!
**Tempo estimado**: 2-3 horas
**Complexidade**: Média

Responda com "sim" quando quiser começar! 🚀
