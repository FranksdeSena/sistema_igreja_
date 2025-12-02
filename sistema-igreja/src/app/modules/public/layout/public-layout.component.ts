import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col bg-white">
      <!-- Header Público -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo -->
            <div class="flex items-center">
              <a routerLink="/" class="flex items-center gap-2">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-blue to-primary-orange rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">⛪</span>
                </div>
                <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-blue to-blue-800">
                  IBN Peniel
                </span>
              </a>
            </div>

            <!-- Menu Desktop -->
            <nav class="hidden md:flex items-center gap-4">
              <a routerLink="/" routerLinkActive="text-primary-blue font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Início</a>
              <a routerLink="/galeria" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Galeria</a>
              <a routerLink="/agenda" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Agenda</a>
              <a routerLink="/mensagens" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Mensagens</a>
              <a routerLink="/lideranca" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Liderança</a>
              <a routerLink="/sobre" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Sobre</a>
              <a routerLink="/testemunhos-publico" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Testemunhos</a>
              <a routerLink="/pedir-oracao" routerLinkActive="text-primary-blue font-semibold" class="text-sm text-gray-600 hover:text-primary-blue transition-colors">Oração</a>
            </nav>

            <!-- Botão Área de Membros -->
            <div class="hidden md:flex items-center">
              <a routerLink="/auth/login" class="px-5 py-2 rounded-full bg-primary-blue text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Área de Membros
              </a>
            </div>

            <!-- Menu Mobile Button (Placeholder) -->
            <button class="md:hidden p-2 text-gray-600">
              <span class="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Conteúdo Principal -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="col-span-1 md:col-span-2">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">⛪</span>
                <span class="text-xl font-bold">IBN Peniel</span>
              </div>
              <p class="text-gray-400 max-w-sm">
                Uma comunidade de fé, esperança e amor. Venha nos visitar e fazer parte desta família.
              </p>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul class="space-y-2 text-gray-400">
                <li><a routerLink="/" class="hover:text-white transition-colors">Início</a></li>
                <li><a routerLink="/galeria" class="hover:text-white transition-colors">Galeria de Fotos</a></li>
                <li><a routerLink="/agenda" class="hover:text-white transition-colors">Próximos Eventos</a></li>
                <li><a routerLink="/login" class="hover:text-white transition-colors">Área do Membro</a></li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-4">Contato</h3>
              <ul class="space-y-2 text-gray-400">
                <li>📍 Rua da Igreja, 123</li>
                <li>📞 (11) 99999-9999</li>
                <li>✉️ contato@igreja.com</li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p class="text-sm mb-2">
              &copy; {{ currentYear }} IBN Peniel. Todos os direitos reservados.
            </p>
            <p class="text-xs text-gray-500">
              Desenvolvido por <a href="https://futurannet.com" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors">Futurannet Design</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
}
