import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FirebaseAuthService } from '../../core/services/firebase-auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside
        class="bg-white w-64 border-r border-gray-200 flex flex-col transition-all duration-300 fixed h-full z-20"
        [class.-translate-x-full]="!isSidebarOpen"
        [class.translate-x-0]="isSidebarOpen"
        class="lg:translate-x-0 lg:static"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-gray-100">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-blue to-primary-orange rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold">⛪</span>
          </div>
          <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            Sistema Igreja
          </span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-blue-50 text-primary-blue"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">📊</span>
            <span class="font-medium">Visão Geral</span>
          </a>

          <a
            routerLink="/dashboard/membros"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">👥</span>
            <span class="font-medium">Membros</span>
          </a>

          <a
            routerLink="/dashboard/aniversariantes"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">🎂</span>
            <span class="font-medium">Aniversariantes</span>
          </a>

          <a
            routerLink="/dashboard/celulas"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">🏘️</span>
            <span class="font-medium">Células</span>
          </a>

          <a
            routerLink="/dashboard/ministerios"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">🎤</span>
            <span class="font-medium">Ministérios</span>
          </a>

          <a
            routerLink="/dashboard/financeiro"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">💰</span>
            <span class="font-medium">Financeiro</span>
          </a>

          <a
            routerLink="/dashboard/eventos"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">📅</span>
            <span class="font-medium">Eventos</span>
          </a>

          <a
            routerLink="/dashboard/media"
            routerLinkActive="bg-blue-50 text-primary-blue"
            class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
          >
            <span class="mr-3 text-xl group-hover:scale-110 transition-transform">📷</span>
            <span class="font-medium">Mídia</span>
          </a>

          <!-- Pastor Only (Admin also sees) -->
          <div *ngIf="['admin', 'pastor'].includes((authService.currentUser$ | async)?.role || '')" class="pt-4 mt-4 border-t border-gray-100">
            <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pastoral</p>
            <a
              routerLink="/dashboard/pastor"
              routerLinkActive="bg-blue-50 text-primary-blue"
              class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
            >
              <span class="mr-3 text-xl group-hover:scale-110 transition-transform">✝️</span>
              <span class="font-medium">Área Pastoral</span>
            </a>
          </div>

          <!-- Admin Only -->
          <div *ngIf="(authService.currentUser$ | async)?.role === 'admin'" class="pt-4 mt-4 border-t border-gray-100">
            <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administração</p>
            <a
              routerLink="/dashboard/usuarios"
              routerLinkActive="bg-blue-50 text-primary-blue"
              class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
            >
              <span class="mr-3 text-xl group-hover:scale-110 transition-transform">🛡️</span>
              <span class="font-medium">Usuários</span>
            </a>
            <a
              routerLink="/dashboard/auditoria"
              routerLinkActive="bg-blue-50 text-primary-blue"
              class="flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 group transition-colors"
            >
              <span class="mr-3 text-xl group-hover:scale-110 transition-transform">📋</span>
              <span class="font-medium">Auditoria</span>
            </a>
          </div>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold text-lg">
              {{ (authService.currentUser$ | async)?.full_name?.charAt(0) || 'U' }}
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ (authService.currentUser$ | async)?.full_name || 'Usuário' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ (authService.currentUser$ | async)?.email || 'email@exemplo.com' }}
              </p>
            </div>
          </div>
          
          <!-- Logout Button -->
          <button 
            (click)="onLogout()"
            class="mt-2 w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header Mobile -->
        <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden">
          <div class="flex items-center">
            <button
              (click)="toggleSidebar()"
              class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <span class="text-2xl">☰</span>
            </button>
            <span class="ml-3 text-lg font-bold text-gray-900">Sistema Igreja</span>
          </div>
        </header>

        <!-- Header Desktop -->
        <header class="hidden lg:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-8">
          <h2 class="text-2xl font-bold text-gray-800">{{ pageTitle }}</h2>
          <div class="flex items-center gap-4" *ngIf="authService.currentUser$ | async as currentUser">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-red-100 text-red-800': currentUser.role === 'admin',
                    'bg-blue-100 text-blue-800': currentUser.role === 'pastor',
                    'bg-purple-100 text-purple-800': currentUser.role === 'secretaria',
                    'bg-gray-100 text-gray-800': currentUser.role === 'member'
                  }">
              {{ getRoleName(currentUser.role) }}
            </span>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ currentDate | date:"EEEE, d 'de' MMMM" }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Overlay Mobile -->
      <div
        *ngIf="isSidebarOpen"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 z-10 lg:hidden"
        (click)="toggleSidebar()"
      ></div>
    </div>
  `,
  styles: [],
})
export class DashboardLayoutComponent implements OnInit {
  isSidebarOpen = false;
  pageTitle = 'Visão Geral';
  currentDate = new Date();

  constructor(
    private router: Router,
    public authService: FirebaseAuthService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
        this.isSidebarOpen = false;
      });

    this.updatePageTitle();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogout() {
    this.authService.signOut();
  }

  getRoleName(role: string): string {
    const roles: { [key: string]: string } = {
      admin: 'Administrador',
      pastor: 'Pastor',
      secretaria: 'Secretaria',
      member: 'Membro'
    };
    return roles[role] || role;
  }

  private updatePageTitle() {
    const url = this.router.url;
    if (url.includes('/membros')) this.pageTitle = 'Gestão de Membros';
    else if (url.includes('/aniversariantes')) this.pageTitle = 'Aniversariantes';
    else if (url.includes('/celulas')) this.pageTitle = 'Células';
    else if (url.includes('/ministerios')) this.pageTitle = 'Ministérios';
    else if (url.includes('/financeiro')) this.pageTitle = 'Gestão Financeira';
    else if (url.includes('/eventos')) this.pageTitle = 'Gestão de Eventos';
    else if (url.includes('/midia')) this.pageTitle = 'Gestão de Mídia';
    else if (url.includes('/auditoria')) this.pageTitle = 'Auditoria do Sistema';
    else this.pageTitle = 'Visão Geral';
  }
}
