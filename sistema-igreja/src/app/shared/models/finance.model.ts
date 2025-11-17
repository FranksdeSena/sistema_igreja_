// Transação financeira
export interface Transaction {
  id: string;
  churchId: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'check' | 'transfer' | 'card' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  paidBy?: string;
  paidTo?: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Resumo financeiro
export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  pendingAmount: number;
}
