import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-blue via-primary-yellow to-primary-orange flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Card de Login -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <!-- Logo/Título -->
          <div class="text-center mb-8">
            <div class="inline-block p-4 bg-gradient-to-br from-primary-blue to-primary-orange rounded-xl mb-4">
              <span class="text-4xl text-white">⛪</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">Sistema Igreja</h1>
            <p class="text-gray-600 mt-2">Bem-vindo ao gerenciamento de membros</p>
          </div>

          <!-- Formulário -->
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="input-field"
                placeholder="seu@email.com"
              />
            </div>

            <!-- Senha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                formControlName="password"
                class="input-field"
                placeholder="••••••••"
              />
            </div>

            <!-- Lembrar senha -->
            <div class="flex items-center">
              <input
                type="checkbox"
                id="remember"
                class="rounded border-gray-300"
              />
              <label for="remember" class="ml-2 text-sm text-gray-600">
                Lembrar senha
              </label>
            </div>

            <!-- Mensagem de Erro -->
            <div *ngIf="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <!-- Botão Login -->
            <button
              type="submit"
              [disabled]="isLoading"
              class="w-full btn-primary mt-6"
            >
              <span *ngIf="!isLoading">Entrar</span>
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <span class="inline-block animate-spin mr-2">⏳</span>
                Carregando...
              </span>
            </button>
          </form>

          <!-- Divisor -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          <!-- Botão Demo -->
          <button
            type="button"
            (click)="onDemoLogin()"
            class="w-full px-4 py-2 bg-primary-yellow text-gray-900 rounded-lg font-semibold hover:bg-accent-yellow transition-colors duration-200 shadow-md"
          >
            Entrar com Demo
          </button>

          <!-- Footer -->
          <div class="text-center mt-6">
            <p class="text-gray-600 text-sm mb-1">
              © {{ currentYear }} IBN Peniel. Todos os direitos reservados.
            </p>
            <p class="text-gray-500 text-xs">
              Desenvolvido por <a href="https://futurannet.com" target="_blank" class="text-blue-600 hover:text-blue-700 transition-colors">Futurannet Design</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private authService: FirebaseAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;

      this.authService.signIn(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.isAuthenticated) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.error || 'Falha na autenticação';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Erro de conexão com o servidor';
          console.error('Erro ao fazer login:', err);
        },
      });
    }
  }

  onDemoLogin(): void {
    this.loginForm.patchValue({
      email: 'frme@ibn.com',
      password: 'password123',
    });
    // Não executa login automático
  }
}
