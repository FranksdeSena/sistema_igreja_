import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrayerRequestsDatabaseService } from '../../../core/services/prayer-requests-database.service';

@Component({
  selector: 'app-prayer-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Hero -->
      <div class="relative bg-gradient-to-br from-purple-600 to-blue-600 py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-3xl mx-auto">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">🙏 Pedidos de Oração</h1>
          <p class="text-xl text-purple-100">
            Compartilhe seu pedido e nossa equipe de intercessão orará por você
          </p>
        </div>
      </div>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div *ngIf="!submitted" class="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <form [formGroup]="prayerForm" (ngSubmit)="onSubmit()">
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Seu Nome *</label>
              <input 
                type="text" 
                formControlName="name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Como podemos te chamar?">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email (opcional)</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu@email.com">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="(00) 00000-0000">
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Seu Pedido de Oração *</label>
              <textarea 
                formControlName="request"
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Compartilhe seu pedido de oração conosco..."></textarea>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p class="text-sm text-purple-800">
                🔒 <strong>Privacidade:</strong> Seu pedido será revisado pela nossa equipe antes de ser compartilhado publicamente. 
                Você pode optar por manter seu pedido privado.
              </p>
            </div>

            <div class="flex gap-4">
              <button 
                type="submit"
                [disabled]="!prayerForm.valid || saving"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
                {{ saving ? 'Enviando...' : '🙏 Enviar Pedido' }}
              </button>
              <button 
                type="button"
                (click)="cancel()"
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="submitted" class="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-12 text-center border border-green-200">
          <div class="text-6xl mb-6">✅</div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Pedido Recebido!</h2>
          <p class="text-lg text-gray-700 mb-6">
            Obrigado por compartilhar seu pedido. Nossa equipe de intercessão já está orando por você!
          </p>
          <button 
            (click)="reset()"
            class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Enviar Outro Pedido
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PrayerRequestFormComponent {
  prayerForm: FormGroup;
  saving = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private prayerService: PrayerRequestsDatabaseService,
    private router: Router
  ) {
    this.prayerForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      request: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.prayerForm.valid) {
      this.saving = true;
      try {
        await this.prayerService.addPrayerRequest(this.prayerForm.value);
        this.submitted = true;
      } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        alert('Erro ao enviar pedido. Tente novamente.');
      } finally {
        this.saving = false;
      }
    }
  }

  reset(): void {
    this.prayerForm.reset();
    this.submitted = false;
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
