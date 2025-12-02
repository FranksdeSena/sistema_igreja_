import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimoniesDatabaseService } from '../../../core/services/testimonies-database.service';
import { Testimony } from '../../../shared/models/testimony.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public-testimonies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white min-h-screen">
      <!-- Hero -->
      <div class="relative bg-gradient-to-br from-green-600 to-blue-600 py-24 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div class="relative max-w-3xl mx-auto">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">Testemunhos</h1>
          <p class="text-xl text-green-100">
            Histórias reais de como Deus tem transformado vidas
          </p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div *ngIf="(testimonies$ | async) as testimonies" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let testimony of testimonies" 
               class="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100 hover:shadow-2xl transition-all hover:-translate-y-2">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {{ testimony.authorName.charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-lg text-gray-900">{{ testimony.authorName }}</h3>
                <p *ngIf="testimony.category" class="text-sm text-green-600">{{ testimony.category }}</p>
              </div>
            </div>
            <h4 class="font-bold text-xl text-gray-900 mb-4">{{ testimony.title }}</h4>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ testimony.content }}</p>
            <p class="text-xs text-gray-400 mt-6">{{ testimony.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>

        <div *ngIf="!(testimonies$ | async)?.length" class="text-center py-20">
          <p class="text-6xl mb-6">💬</p>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Em breve teremos testemunhos para compartilhar!</h2>
          <p class="text-gray-600">Aguarde as histórias de transformação da nossa comunidade.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PublicTestimoniesComponent implements OnInit {
  testimonies$: Observable<Testimony[]>;

  constructor(private testimoniesService: TestimoniesDatabaseService) {
    this.testimonies$ = this.testimoniesService.getPublicTestimonies();
  }

  ngOnInit(): void {}
}
