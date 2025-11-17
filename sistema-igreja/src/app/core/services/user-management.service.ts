import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { SupabaseInitService } from './supabase-init.service';
import { User } from './supabase-auth.service';

export interface CreateUserRequest {
  email: string;
  full_name: string;
  role: 'admin' | 'pastor' | 'secretaria' | 'member';
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: 'admin' | 'pastor' | 'secretaria' | 'member';
  is_active?: boolean;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private supabaseInit = inject(SupabaseInitService);

  private usersSubject = new BehaviorSubject<User[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  users$ = this.usersSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  /**
   * Obter todos os usuários (apenas para admin)
   */
  getAllUsers(): Observable<User[]> {
    this.isLoadingSubject.next(true);
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.isLoadingSubject.next(false);
      return of([]);
    }

    return from(client.from('users').select('*').order('created_at', { ascending: false })).pipe(
      tap((response) => {
        if (response.data) {
          this.usersSubject.next(response.data as User[]);
        }
        this.isLoadingSubject.next(false);
      }),
      map((response) => (response.data as User[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        this.isLoadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Obter usuário por ID
   */
  getUserById(userId: string): Observable<User | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of(null);
    }

    return from(client.from('users').select('*').eq('id', userId).single()).pipe(
      map((response) => (response.data as User) || null),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Criar novo usuário (apenas admin)
   * Supabase Auth + registro na tabela
   */
  createUser(request: CreateUserRequest): Observable<User | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(null);
    }

    // Gerar senha temporária
    const tempPassword = this.generateTemporaryPassword();

    return from(
      client.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: request.full_name,
          role: request.role,
        },
      })
    ).pipe(
      switchMap((response) => {
        if (response.error) {
          this.errorSubject.next(response.error.message);
          return of(null);
        }

        if (!response.data.user) {
          this.errorSubject.next('Erro ao criar usuário');
          return of(null);
        }

        // Inserir na tabela public.users
        return from(
          client.from('users').insert({
            id: response.data.user.id,
            email: request.email,
            full_name: request.full_name,
            role: request.role,
            is_active: true,
          })
        ).pipe(
          switchMap(() => this.getUserById(response.data.user!.id)),
          tap(() => {
            this.errorSubject.next(null);
            this.getAllUsers().subscribe(); // Recarregar lista
          }),
          catchError((error) => {
            this.errorSubject.next(error.message);
            return of(null);
          })
        );
      })
    );
  }

  /**
   * Atualizar usuário
   */
  updateUser(userId: string, request: UpdateUserRequest): Observable<User | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(null);
    }

    return from(client.from('users').update(request).eq('id', userId).select().single()).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.getAllUsers().subscribe(); // Recarregar lista
      }),
      map((response) => (response.data as User) || null),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Deletar usuário (apenas admin)
   */
  deleteUser(userId: string): Observable<boolean> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(false);
    }

    return from(client.auth.admin.deleteUser(userId)).pipe(
      switchMap(() => {
        // Deletar da tabela public.users
        return from(client.from('users').delete().eq('id', userId));
      }),
      tap(() => {
        this.errorSubject.next(null);
        this.getAllUsers().subscribe(); // Recarregar lista
      }),
      map(() => true),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(false);
      })
    );
  }

  /**
   * Ativar/Desativar usuário
   */
  toggleUserStatus(userId: string, isActive: boolean): Observable<User | null> {
    return this.updateUser(userId, { is_active: isActive });
  }

  /**
   * Buscar usuários por papel (role)
   */
  getUsersByRole(role: string): Observable<User[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(client.from('users').select('*').eq('role', role).eq('is_active', true)).pipe(
      map((response) => (response.data as User[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Buscar usuários por termo
   */
  searchUsers(term: string): Observable<User[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(
      client.from('users').select('*').or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
    ).pipe(
      map((response) => (response.data as User[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Resetar senha do usuário
   */
  resetUserPassword(email: string): Observable<boolean> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(false);
    }

    return from(
      client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    ).pipe(
      tap(() => {
        this.errorSubject.next(null);
      }),
      map(() => true),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(false);
      })
    );
  }

  /**
   * Contar usuários por papel
   */
  countUsersByRole(): Observable<{ [key: string]: number }> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({});
    }

    return from(client.from('users').select('role').eq('is_active', true)).pipe(
      map((response) => {
        const counts: { [key: string]: number } = {
          admin: 0,
          pastor: 0,
          secretaria: 0,
          member: 0,
        };

        (response.data as any[])?.forEach((user) => {
          if (user.role in counts) {
            counts[user.role]++;
          }
        });

        return counts;
      }),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of({});
      })
    );
  }

  /**
   * Exportar usuários (CSV)
   */
  exportUsersToCSV(): Observable<Blob> {
    return this.getAllUsers().pipe(
      map((users) => {
        const headers = ['ID', 'Email', 'Nome Completo', 'Papel', 'Ativo', 'Data de Criação'];
        const rows = users.map((user) => [
          user.id,
          user.email,
          user.full_name,
          user.role,
          user.is_active ? 'Sim' : 'Não',
          new Date(user.created_at).toLocaleDateString('pt-BR'),
        ]);

        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  /**
   * Gerar senha temporária
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Obter usuários atualizados (observable contínuo)
   */
  getUpdatedUsers(): Observable<User[]> {
    return this.users$;
  }

  /**
   * Limpar erro
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
