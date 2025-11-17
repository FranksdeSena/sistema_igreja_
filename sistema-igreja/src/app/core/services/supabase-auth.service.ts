import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { SupabaseInitService } from './supabase-init.service';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pastor' | 'secretaria' | 'member';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  private supabaseInit = inject(SupabaseInitService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa o serviço de autenticação
   * Recupera a sessão atual e sincroniza com listener
   */
  private initializeAuth(): void {
    const client = this.supabaseInit.getClient();
    if (!client) return;

    // Recuperar sessão existente
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        this.loadUserData(session.user.id);
      } else {
        this.isAuthenticatedSubject.next(false);
        this.isLoadingSubject.next(false);
      }
    });

    // Escutar mudanças de autenticação
    client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.loadUserData(session.user.id);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.isLoadingSubject.next(false);
      }
    });
  }

  /**
   * Carrega dados do usuário da tabela public.users
   */
  private loadUserData(userId: string): void {
    const client = this.supabaseInit.getClient();
    if (!client) return;

    from(client.from('users').select('*').eq('id', userId).single())
      .pipe(
        tap((response) => {
          if (response.data) {
            this.currentUserSubject.next(response.data as User);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) => {
          console.error('Erro ao carregar dados do usuário:', error);
          return of(null);
        }),
        tap(() => this.isLoadingSubject.next(false))
      )
      .subscribe();
  }

  /**
   * Sign up com email e senha
   */
  signUp(
    email: string,
    password: string,
    fullName: string,
    role: 'member' | 'pastor' | 'secretaria' = 'member'
  ): Observable<AuthResponse> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({
        user: null,
        error: 'Supabase não inicializado',
        isAuthenticated: false,
      });
    }

    return from(
      client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
    ).pipe(
      switchMap((response) => {
        if (response.error) {
          return of({
            user: null,
            error: response.error.message,
            isAuthenticated: false,
          });
        }

        if (!response.data.user) {
          return of({
            user: null,
            error: 'Usuário não foi criado',
            isAuthenticated: false,
          });
        }

        const userId = response.data.user.id;

        // Criar registro na tabela public.users
        return from(
          client.from('users').insert({
            id: userId,
            email,
            full_name: fullName,
            role,
            is_active: true,
          })
        ).pipe(
          switchMap(() => this.loadUserAndReturn(userId)),
          catchError((error) => {
            console.error('Erro ao criar usuário na tabela:', error);
            return of({
              user: null,
              error: 'Erro ao criar registro do usuário',
              isAuthenticated: false,
            });
          })
        );
      })
    );
  }

  /**
   * Login com email e senha
   */
  signIn(email: string, password: string): Observable<AuthResponse> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({
        user: null,
        error: 'Supabase não inicializado',
        isAuthenticated: false,
      });
    }

    return from(
      client.auth.signInWithPassword({
        email,
        password,
      })
    ).pipe(
      switchMap((response) => {
        if (response.error) {
          return of({
            user: null,
            error: response.error.message,
            isAuthenticated: false,
          });
        }

        if (!response.data.user) {
          return of({
            user: null,
            error: 'Falha ao fazer login',
            isAuthenticated: false,
          });
        }

        return this.loadUserAndReturn(response.data.user.id);
      })
    );
  }

  /**
   * Sign out do usuário atual
   */
  signOut(): Observable<{ error: string | null }> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({ error: 'Supabase não inicializado' });
    }

    return from(client.auth.signOut()).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
      }),
      map(() => ({ error: null })),
      catchError((error) => of({ error: error.message }))
    );
  }

  /**
   * Redefinir senha com email
   */
  resetPassword(email: string): Observable<{ error: string | null }> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({ error: 'Supabase não inicializado' });
    }

    return from(
      client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    ).pipe(
      map(() => ({ error: null })),
      catchError((error) => of({ error: error.message }))
    );
  }

  /**
   * Atualizar senha
   */
  updatePassword(newPassword: string): Observable<{ error: string | null }> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({ error: 'Supabase não inicializado' });
    }

    return from(client.auth.updateUser({ password: newPassword })).pipe(
      map(() => ({ error: null })),
      catchError((error) => of({ error: error.message }))
    );
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar se usuário é admin
   */
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  /**
   * Verificar se usuário é pastor
   */
  isPastor(): boolean {
    return this.currentUserSubject.value?.role === 'pastor';
  }

  /**
   * Verificar se usuário é secretária
   */
  isSecretaria(): boolean {
    return this.currentUserSubject.value?.role === 'secretaria';
  }

  /**
   * Verificar se autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Carregar usuário e retornar resposta
   */
  private loadUserAndReturn(userId: string): Observable<AuthResponse> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({
        user: null,
        error: 'Supabase não inicializado',
        isAuthenticated: false,
      });
    }

    return from(client.from('users').select('*').eq('id', userId).single()).pipe(
      tap((response) => {
        if (response.data) {
          this.currentUserSubject.next(response.data as User);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      map((response) => ({
        user: (response.data as User) || null,
        error: response.error?.message || null,
        isAuthenticated: !!response.data,
      })),
      catchError((error) =>
        of({
          user: null,
          error: error.message,
          isAuthenticated: false,
        })
      ),
      tap(() => this.isLoadingSubject.next(false))
    );
  }
}
