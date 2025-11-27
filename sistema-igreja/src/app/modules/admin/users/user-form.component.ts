import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserManagementService, UserProfile } from '../../../core/services/user-management.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
        </h2>
        <p class="text-gray-500">
          {{ isEditing ? 'Atualize as permissões do usuário' : 'Crie um novo usuário para acessar o sistema' }}
        </p>
      </div>

      <!-- Card do Formulário -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Nome Completo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <input
              type="text"
              formControlName="full_name"
              class="input-field"
              placeholder="Ex: João da Silva"
            />
            <p *ngIf="userForm.get('full_name')?.touched && userForm.get('full_name')?.invalid" class="text-red-500 text-xs mt-1">
              Nome é obrigatório
            </p>
          </div>

          <!-- Email (Readonly se editando) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="input-field"
              [class.bg-gray-100]="isEditing"
              [readonly]="isEditing"
              placeholder="Ex: joao@igreja.com"
            />
            <p *ngIf="userForm.get('email')?.touched && userForm.get('email')?.invalid" class="text-red-500 text-xs mt-1">
              Email válido é obrigatório
            </p>
          </div>

          <!-- Senha (apenas na criação) -->
          <div *ngIf="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              formControlName="password"
              class="input-field"
              placeholder="Mínimo 6 caracteres"
            />
            <p *ngIf="userForm.get('password')?.touched && userForm.get('password')?.invalid" class="text-red-500 text-xs mt-1">
              Senha é obrigatória (mínimo 6 caracteres)
            </p>
          </div>

          <!-- Função / Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Função no Sistema</label>
            <select formControlName="role" class="input-field">
              <option value="member">Membro (Acesso Básico)</option>
              <option value="secretaria">Secretaria (Gestão de Membros)</option>
              <option value="pastor">Pastor (Acesso Total + Relatórios)</option>
              <option value="admin">Administrador (Gestão de Usuários)</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">
              Define o nível de acesso e permissões dentro do sistema.
            </p>
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              formControlName="is_active"
              class="rounded border-gray-300 text-primary-blue focus:ring-primary-blue h-4 w-4"
            />
            <label for="is_active" class="ml-2 block text-sm text-gray-900">
              Usuário Ativo
            </label>
          </div>

          <!-- Botões -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              routerLink="/dashboard/usuarios"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="userForm.invalid || isLoading"
              class="btn-primary flex items-center"
            >
              <span *ngIf="isLoading" class="mr-2">⏳</span>
              {{ isEditing ? 'Salvar Alterações' : 'Criar Usuário' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditing = false;
  userId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['member', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditing = true;
      this.userForm.get('email')?.disable(); // Não permite mudar email na edição
      this.userForm.get('password')?.clearValidators(); // Remove validação de senha na edição
      this.userForm.get('password')?.updateValueAndValidity();
      this.loadUser(this.userId);
    }
  }

  loadUser(uid: string): void {
    this.isLoading = true;
    this.userService.getUserById(uid).pipe(take(1)).subscribe(user => {
      this.isLoading = false;
      if (user) {
        this.userForm.patchValue(user);
      } else {
        this.router.navigate(['/dashboard/usuarios']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formData = this.userForm.getRawValue();

      try {
        if (this.isEditing && this.userId) {
          // Na edição, não passa a senha
          const { password, ...updateData } = formData;
          await this.userService.updateUser(this.userId, updateData);
        } else {
          // Na criação, passa a senha
          const { password, ...userData } = formData;
          await this.userService.createUser(userData, password);
        }
        this.router.navigate(['/dashboard/usuarios']);
      } catch (error: any) {
        console.error('Erro ao salvar usuário:', error);
        alert(error.message || 'Erro ao salvar usuário. Tente novamente.');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
