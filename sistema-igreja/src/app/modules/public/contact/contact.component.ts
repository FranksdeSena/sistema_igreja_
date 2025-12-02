import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Fale Conosco</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para ouvir você. Envie sua mensagem, pedido de oração ou dúvida.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Informações de Contato -->
          <div class="bg-white rounded-2xl shadow-sm p-8 h-fit">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Nossos Contatos</h2>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-primary-blue text-xl">
                  📍
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Endereço</h3>
                  <p class="text-gray-600 mt-1">Rua da Igreja, 123<br>Bairro Central, Cidade - UF</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">
                  📞
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Telefone / WhatsApp</h3>
                  <p class="text-gray-600 mt-1">(11) 99999-9999</p>
                  <p class="text-sm text-gray-500">Seg a Sex, das 9h às 17h</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl">
                  ✉️
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">E-mail</h3>
                  <p class="text-gray-600 mt-1">contato@igrejaviva.com.br</p>
                </div>
              </div>
            </div>

            <!-- Mapa (Placeholder) -->
            <div class="mt-8 bg-gray-200 rounded-xl h-64 w-full flex items-center justify-center text-gray-500">
              [Mapa do Google aqui]
            </div>
          </div>

          <!-- Formulário -->
          <div class="bg-white rounded-2xl shadow-sm p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Envie uma Mensagem</h2>
            
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" name="name" ngModel required
                       class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" name="email" ngModel required email
                         class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input type="tel" name="phone" ngModel
                         class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <select name="subject" ngModel required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                  <option value="" disabled selected>Selecione um assunto</option>
                  <option value="duvida">Dúvida</option>
                  <option value="oracao">Pedido de Oração</option>
                  <option value="visita">Quero uma Visita</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea name="message" ngModel required rows="5"
                          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"></textarea>
              </div>

              <button type="submit" [disabled]="!contactForm.valid || isSubmitting"
                      class="w-full py-3 bg-primary-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting ? 'Enviando...' : 'Enviar Mensagem' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContactComponent {
  isSubmitting = false;

  onSubmit() {
    this.isSubmitting = true;
    // Simulação de envio
    setTimeout(() => {
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      this.isSubmitting = false;
      // Reset form logic here if needed
    }, 1500);
  }
}
