import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersDatabaseService } from '../../core/services/members-database.service';
import { Member } from '../../shared/models';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditMode ? 'Editar Membro' : 'Novo Membro' }}
        </h1>
        <p class="text-sm text-gray-600 mt-2">
          {{
            isEditMode ? 'Atualize as informações do membro' : 'Cadastre um novo membro na igreja'
          }}
        </p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Seção de Informações Básicas -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Ex: João Silva"
                  class="input-field"
                />
                <span
                  *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
                  class="text-sm text-red-600"
                >
                  Nome é obrigatório
                </span>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input
                  type="tel"
                  formControlName="phone"
                  placeholder="Ex: (11) 98765-4321"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  formControlName="whatsapp"
                  placeholder="Ex: (11) 98765-4321"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Data de Nascimento</label
                >
                <input type="date" formControlName="birthDate" class="input-field" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Data de Entrada *</label
                >
                <input type="date" formControlName="joinDate" class="input-field" />
              </div>
            </div>
          </div>

          <!-- Seção de Status e Função -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Status e Função</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select formControlName="status" class="input-field">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="visiting">Visitante</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Função</label>
                <input
                  type="text"
                  formControlName="role"
                  placeholder="Ex: Líder, Membro, Presbítero"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Seção de Endereço -->
          <div class="border-b pb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Endereço</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                <input
                  type="text"
                  formControlName="address"
                  placeholder="Ex: Rua das Flores, 123"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <input
                  type="text"
                  formControlName="city"
                  placeholder="Ex: São Paulo"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  formControlName="state"
                  placeholder="Ex: SP"
                  maxlength="2"
                  class="input-field"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                <input
                  type="text"
                  formControlName="zipCode"
                  placeholder="Ex: 01234-567"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 pt-6">
            <button type="submit" class="btn-primary" [disabled]="isLoading">
              <span *ngIf="!isLoading">💾 {{ isEditMode ? 'Atualizar' : 'Salvar' }}</span>
              <span *ngIf="isLoading">⏳ Salvando...</span>
            </button>
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class MemberFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  isLoading = false;
  memberId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private membersService: MembersDatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', Validators.required],
      whatsapp: ['', Validators.required],
      birthDate: [''],
      joinDate: ['', Validators.required],
      status: ['active', Validators.required],
      role: ['Membro'],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.memberId = id;
      this.loadMember(id);
    }
  }

  loadMember(id: string): void {
    console.log('🔍 Buscando membro:', id);
    this.membersService.getMemberById(id).subscribe({
      next: (member) => {
        if (member) {
          console.log('✅ Membro encontrado:', member);
          
          // Converter datas para formato YYYY-MM-DD para o input type="date"
          const birthDateStr = member.birthDate instanceof Date && !isNaN(member.birthDate.getTime())
            ? member.birthDate.toISOString().split('T')[0] 
            : '';
            
          const joinDateStr = member.joinDate instanceof Date && !isNaN(member.joinDate.getTime())
            ? member.joinDate.toISOString().split('T')[0] 
            : '';

          console.log('📅 Datas convertidas:', { birthDateStr, joinDateStr });

          this.form.patchValue({
            name: member.name,
            phone: member.phone,
            whatsapp: member.whatsapp,
            birthDate: birthDateStr,
            joinDate: joinDateStr,
            status: member.status,
            role: member.role,
            address: member.address,
            city: member.city,
            state: member.state,
            zipCode: member.zipCode
          });
        } else {
          console.error('❌ Membro não encontrado no banco de dados');
        }
      },
      error: (err) => console.error('❌ Erro ao buscar membro:', err)
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;

    const formValue = this.form.value;
    const memberData = {
      ...formValue,
      churchId: 'church-1',
      photo: '👤',
      birthDate: formValue.birthDate ? new Date(formValue.birthDate) : undefined,
      joinDate: new Date(formValue.joinDate),
    };

    try {
      if (this.isEditMode && this.memberId) {
        await this.membersService.updateMember(this.memberId, memberData);
      } else {
        await this.membersService.addMember(memberData);
      }
      this.router.navigate(['/dashboard/membros']);
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      alert('Erro ao salvar membro. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/membros']);
  }
}
