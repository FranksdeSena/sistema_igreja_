import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Hero -->
      <div class="relative bg-gray-900 py-24 px-4 sm:px-6 lg:px-8 text-center">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30"></div>
          <!-- Placeholder image -->
          <img src="https://images.unsplash.com/photo-1445445290350-12a3b863ad77?q=80&w=2070&auto=format&fit=crop" alt="Igreja" class="w-full h-full object-cover opacity-40">
        </div>
        <div class="relative max-w-3xl mx-auto">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Sobre Nós</h1>
          <p class="mt-6 text-xl text-gray-300">
            Conheça nossa história, nossa visão e o que acreditamos.
          </p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <!-- Nossa História -->
        <div class="mb-20">
          <h2 class="text-3xl font-bold text-gray-900 mb-6 border-l-4 border-primary-blue pl-4">Nossa História</h2>
          <div class="prose prose-lg text-gray-600 max-w-none">
            <p class="mb-4">
              A Igreja Viva nasceu do sonho de criar uma comunidade onde as pessoas pudessem encontrar não apenas uma religião, mas um relacionamento vivo e transformador com Deus.
            </p>
            <p>
              Fundada em [ANO], começamos com um pequeno grupo de famílias reunidas em uma sala de estar. Com o passar dos anos, vimos o agir de Deus transformando vidas, restaurando famílias e impactando nossa cidade. Hoje, continuamos com a mesma essência: amar a Deus e amar as pessoas.
            </p>
          </div>
        </div>

        <!-- Missão e Visão -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div class="bg-blue-50 p-8 rounded-2xl border border-blue-100">
            <div class="w-12 h-12 bg-primary-blue text-white rounded-lg flex items-center justify-center text-2xl mb-4">🚀</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
            <p class="text-gray-700 leading-relaxed">
              Levar o amor de Jesus a todas as pessoas, promovendo transformação espiritual, social e cultural em nossa comunidade e além.
            </p>
          </div>
          <div class="bg-orange-50 p-8 rounded-2xl border border-orange-100">
            <div class="w-12 h-12 bg-primary-orange text-white rounded-lg flex items-center justify-center text-2xl mb-4">👁️</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h3>
            <p class="text-gray-700 leading-relaxed">
              Ser uma igreja relevante, acolhedora e discipuladora, onde cada pessoa descobre seu propósito e vive plenamente o evangelho.
            </p>
          </div>
        </div>

        <!-- Nossos Valores -->
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary-orange pl-4">Nossos Valores</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="text-center p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow">
              <span class="text-4xl mb-4 block">📖</span>
              <h4 class="text-lg font-bold text-gray-900 mb-2">Bíblia</h4>
              <p class="text-sm text-gray-500">Nossa regra de fé e prática.</p>
            </div>
            <div class="text-center p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow">
              <span class="text-4xl mb-4 block">🙏</span>
              <h4 class="text-lg font-bold text-gray-900 mb-2">Oração</h4>
              <p class="text-sm text-gray-500">Dependência total de Deus.</p>
            </div>
            <div class="text-center p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow">
              <span class="text-4xl mb-4 block">🤝</span>
              <h4 class="text-lg font-bold text-gray-900 mb-2">Comunhão</h4>
              <p class="text-sm text-gray-500">Crescemos juntos em unidade.</p>
            </div>
            <div class="text-center p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow">
              <span class="text-4xl mb-4 block">🌍</span>
              <h4 class="text-lg font-bold text-gray-900 mb-2">Serviço</h4>
              <p class="text-sm text-gray-500">Amar é servir ao próximo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AboutComponent {}
