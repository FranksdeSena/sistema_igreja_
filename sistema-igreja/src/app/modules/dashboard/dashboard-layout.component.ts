import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="flex h-screen bg-background-gray">
      <!-- Sidebar -->
      <aside
        class="w-64 bg-gradient-to-b from-primary-blue to-blue-900 text-white shadow-lg fixed h-full"
      >
        <div class="p-6">
          <div class="flex items-center gap-3 mb-8">
            <div class="text-4xl">⛪</div>
            <div>
              <h1 class="text-xl font-bold">Sistema Igreja</h1>
              <p class="text-sm text-blue-100">Gestão Completa</p>
            </div>
          </div>

          <!-- Menu Principal -->
          <nav class="space-y-2">
            <a
              [href]="'/dashboard'"
              [class.bg-yellow-400]="isActive('/dashboard')"
              [class.text-blue-900]="isActive('/dashboard')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              📊 Dashboard
            </a>
            <a
              [href]="'/members'"
              [class.bg-yellow-400]="isActive('/members')"
              [class.text-blue-900]="isActive('/members')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              👥 Membros
            </a>
            <a
              [href]="'/finance'"
              [class.bg-yellow-400]="isActive('/finance')"
              [class.text-blue-900]="isActive('/finance')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              💰 Finanças
            </a>
            <a
              [href]="'/events'"
              [class.bg-yellow-400]="isActive('/events')"
              [class.text-blue-900]="isActive('/events')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              📅 Eventos
            </a>
            <a
              [href]="'/pastor'"
              [class.bg-yellow-400]="isActive('/pastor')"
              [class.text-blue-900]="isActive('/pastor')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              📖 Área do Pastor
            </a>
            <a
              [href]="'/pastor/galeria'"
              [class.bg-yellow-400]="isActive('/pastor/galeria')"
              [class.text-blue-900]="isActive('/pastor/galeria')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm ml-2"
            >
              🖼️ Galeria de Mídia
            </a>
            <a
              [href]="'/secretaria'"
              [class.bg-yellow-400]="isActive('/secretaria')"
              [class.text-blue-900]="isActive('/secretaria')"
              class="block px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              📋 Secretaria
            </a>
          </nav>
        </div>

        <!-- Footer do Sidebar -->
        <div class="absolute bottom-0 w-64 p-6 border-t border-blue-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">{{ currentUser?.name }}</p>
              <p class="text-xs text-blue-100">{{ getRoleName(currentUser?.role) }}</p>
            </div>
            <button (click)="onLogout()" class="text-blue-100 hover:text-white transition-colors">
              🚪
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="ml-64 w-full overflow-auto">
        <!-- Top Bar -->
        <header class="bg-white shadow-md sticky top-0 z-40">
          <div class="px-8 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <button
                *ngIf="canGoBack()"
                (click)="goBack()"
                class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm"
              >
                ← Voltar
              </button>
              <h2 class="text-2xl font-bold text-gray-900">Bem-vindo ao Sistema Igreja</h2>
            </div>
            <div class="flex items-center gap-4">
              <button class="text-2xl hover:scale-110 transition-transform">🔔</button>
              <button class="text-2xl hover:scale-110 transition-transform">⚙️</button>
            </div>
          </div>
        </header>

        <!-- Conteúdo -->
        <section class="p-8">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [],
})
export class DashboardLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentRoute = '';
  previousRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.previousRoute = this.currentRoute;
        this.currentRoute = event.url;
        console.log('🔗 Rota ativa:', this.currentRoute);
      });
  }

  isActive(route: string): boolean {
    const normalizedRoute = route.toLowerCase();
    const normalizedCurrentRoute = this.currentRoute.toLowerCase();

    // Lógica melhorada: verifica se começa com a rota
    const isRouteActive = normalizedCurrentRoute.startsWith(normalizedRoute);

    console.log(`✓ isActive('${route}') = ${isRouteActive} (current: ${normalizedCurrentRoute})`);

    return isRouteActive;
  }

  canGoBack(): boolean {
    // Mostra botão voltar se estiver em sub-rotas (novo, editar, etc)
    return (
      this.currentRoute.includes('/novo') ||
      this.currentRoute.includes('/editar') ||
      this.currentRoute.includes('/view')
    );
  }

  goBack(): void {
    this.location.back();
  }

  getRoleName(role?: string): string {
    const roleMap: { [key: string]: string } = {
      admin: 'Administrador',
      pastor: 'Pastor',
      secretaria: 'Secretário(a)',
    };
    return roleMap[role || ''] || 'Usuário';
  }

  onLogout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
