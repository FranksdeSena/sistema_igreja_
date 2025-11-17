import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from '../../core/services/finance.service';
import { Transaction } from '../../shared/models';

@Component({
  selector: 'app-finance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode ? 'Editar Transação' : 'Nova Transação' }}
        </h1>
        <p class="text-sm text-gray-600 mt-2">
          {{
            isEditMode ? 'Atualize os dados da transação' : 'Registre uma nova transação financeira'
          }}
        </p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Tipo de Transação -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Tipo de Transação</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select formControlName="type" class="input-field">
                  <option value="">Selecione o tipo...</option>
                  <option value="income">📥 Receita</option>
                  <option value="expense">📤 Despesa</option>
                </select>
                <span
                  *ngIf="form.get('type')?.invalid && form.get('type')?.touched"
                  class="text-sm text-red-600"
                >
                  Tipo é obrigatório
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                <select formControlName="category" class="input-field">
                  <option value="">Selecione a categoria...</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
                <span
                  *ngIf="form.get('category')?.invalid && form.get('category')?.touched"
                  class="text-sm text-red-600"
                >
                  Categoria é obrigatória
                </span>
              </div>
            </div>
          </div>

          <!-- Informações da Transação -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <input
                  type="text"
                  formControlName="description"
                  placeholder="Ex: Dízimo do domingo, Compra de material..."
                  class="input-field"
                />
                <span
                  *ngIf="form.get('description')?.invalid && form.get('description')?.touched"
                  class="text-sm text-red-600"
                >
                  Descrição é obrigatória
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  step="0.01"
                  class="input-field"
                />
                <span
                  *ngIf="form.get('amount')?.invalid && form.get('amount')?.touched"
                  class="text-sm text-red-600"
                >
                  Valor é obrigatório e deve ser maior que 0
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input type="date" formControlName="date" class="input-field" />
                <span
                  *ngIf="form.get('date')?.invalid && form.get('date')?.touched"
                  class="text-sm text-red-600"
                >
                  Data é obrigatória
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Método de Pagamento *</label
                >
                <select formControlName="paymentMethod" class="input-field">
                  <option value="">Selecione o método...</option>
                  <option *ngFor="let method of paymentMethods" [value]="method.value">
                    {{ method.label }}
                  </option>
                </select>
                <span
                  *ngIf="form.get('paymentMethod')?.invalid && form.get('paymentMethod')?.touched"
                  class="text-sm text-red-600"
                >
                  Método de pagamento é obrigatório
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select formControlName="status" class="input-field">
                  <option value="">Selecione o status...</option>
                  <option value="pending">⏳ Pendente</option>
                  <option value="completed">✅ Concluído</option>
                  <option value="cancelled">❌ Cancelado</option>
                </select>
                <span
                  *ngIf="form.get('status')?.invalid && form.get('status')?.touched"
                  class="text-sm text-red-600"
                >
                  Status é obrigatório
                </span>
              </div>
            </div>
          </div>

          <!-- Informações Adicionais -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngIf="form.get('type')?.value === 'income'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Pago por</label>
                <input
                  type="text"
                  formControlName="paidBy"
                  placeholder="Ex: Membros da Igreja"
                  class="input-field"
                />
              </div>

              <div *ngIf="form.get('type')?.value === 'expense'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Pago para</label>
                <input
                  type="text"
                  formControlName="paidTo"
                  placeholder="Ex: Empresa de Construção"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Referência / Nota Fiscal</label
                >
                <input
                  type="text"
                  formControlName="reference"
                  placeholder="Ex: NF-12345"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                <input
                  type="text"
                  formControlName="createdBy"
                  placeholder="Ex: João da Silva"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Observações -->
          <div class="border-b pb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <textarea
              formControlName="notes"
              placeholder="Adicione observações sobre esta transação..."
              rows="4"
              class="input-field"
            ></textarea>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 justify-end">
            <button type="button" (click)="onCancel()" class="btn-secondary">❌ Cancelar</button>
            <button type="submit" [disabled]="form.invalid" class="btn-primary">
              {{ isEditMode ? '💾 Atualizar' : '➕ Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class FinanceFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  transactionId?: string;
  categories: string[] = [];
  paymentMethods: Array<{ value: string; label: string }> = [];

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.categories = this.financeService.getCategories();
    this.paymentMethods = this.financeService.getPaymentMethods();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.transactionId = params['id'];
        this.loadTransaction(params['id']);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      type: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      paymentMethod: ['', Validators.required],
      status: ['completed', Validators.required],
      paidBy: [''],
      paidTo: [''],
      reference: [''],
      createdBy: [''],
      notes: [''],
    });
  }

  private loadTransaction(id: string): void {
    const transaction = this.financeService.getTransaction(id);
    if (transaction) {
      const dateStr = new Date(transaction.date).toISOString().split('T')[0];

      // Resetar com valores da transação
      const patchData = {
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: Number(transaction.amount),
        date: dateStr,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        paidBy: transaction.paidBy || '',
        paidTo: transaction.paidTo || '',
        reference: transaction.reference || '',
        createdBy: transaction.createdBy || '',
        notes: transaction.notes || '',
      };

      this.form.patchValue(patchData);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      console.warn('❌ Formulário inválido');
      return;
    }

    const formValue = this.form.value;

    // Preparar dados da transação (sem incluir id, createdAt, updatedAt)
    const transactionData: any = {
      type: formValue.type,
      category: formValue.category,
      description: formValue.description,
      amount: Number(formValue.amount),
      date: new Date(formValue.date),
      paymentMethod: formValue.paymentMethod,
      status: formValue.status,
      paidBy: formValue.paidBy || null,
      paidTo: formValue.paidTo || null,
      reference: formValue.reference || '',
      createdBy: formValue.createdBy || 'Sistema',
      notes: formValue.notes || '',
      churchId: 'church-1',
    };

    if (this.isEditMode && this.transactionId) {
      this.financeService.updateTransaction(this.transactionId, transactionData);
      console.log('✅ Transação atualizada:', this.transactionId);
    } else {
      this.financeService.createTransaction(transactionData);
      console.log('✅ Transação criada');
    }

    // Navegar de volta para listagem
    this.router.navigate(['/finance']);
  }

  onCancel(): void {
    this.router.navigate(['/finance']);
  }
}
