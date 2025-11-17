import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { SupabaseInitService } from './supabase-init.service';

export interface Member {
  id?: string;
  church_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status?: 'active' | 'inactive' | 'member' | 'visitor';
  join_date?: string;
  baptism_date?: string;
  member_type?: 'regular' | 'leader' | 'staff' | 'visitor';
  cell_group_id?: string;
  receive_notifications?: boolean;
  receive_email?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MemberFilters {
  status?: string;
  memberType?: string;
  cellGroupId?: string;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MembersDatabaseService {
  private supabaseInit = inject(SupabaseInitService);

  private membersSubject = new BehaviorSubject<Member[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private totalMembersSubject = new BehaviorSubject<number>(0);

  members$ = this.membersSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  totalMembers$ = this.totalMembersSubject.asObservable();

  /**
   * Obter todos os membros
   */
  getAllMembers(limit = 100, offset = 0): Observable<Member[]> {
    this.isLoadingSubject.next(true);
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.isLoadingSubject.next(false);
      return of([]);
    }

    return from(
      client
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('full_name', { ascending: true })
        .range(offset, offset + limit - 1)
    ).pipe(
      tap((response) => {
        if (response.data) {
          this.membersSubject.next(response.data as Member[]);
        }
        this.isLoadingSubject.next(false);
      }),
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        this.isLoadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Obter membro por ID
   */
  getMemberById(memberId: string): Observable<Member | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of(null);
    }

    return from(client.from('members').select('*').eq('id', memberId).single()).pipe(
      map((response) => (response.data as Member) || null),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Criar novo membro
   */
  createMember(member: Member): Observable<Member | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(null);
    }

    const newMember = {
      ...member,
      church_id: 'church-1',
      status: 'active',
      join_date: member.join_date || new Date().toISOString().split('T')[0],
    };

    return from(client.from('members').insert([newMember]).select().single()).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.getAllMembers().subscribe(); // Recarregar lista
      }),
      map((response) => (response.data as Member) || null),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Atualizar membro
   */
  updateMember(memberId: string, updates: Partial<Member>): Observable<Member | null> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(null);
    }

    return from(client.from('members').update(updates).eq('id', memberId).select().single()).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.getAllMembers().subscribe(); // Recarregar lista
      }),
      map((response) => (response.data as Member) || null),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Deletar membro
   */
  deleteMember(memberId: string): Observable<boolean> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      this.errorSubject.next('Supabase não inicializado');
      return of(false);
    }

    return from(client.from('members').delete().eq('id', memberId)).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.getAllMembers().subscribe(); // Recarregar lista
      }),
      map(() => true),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of(false);
      })
    );
  }

  /**
   * Buscar membros com filtros
   */
  searchMembers(filters: MemberFilters): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    let query = client.from('members').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.memberType) {
      query = query.eq('member_type', filters.memberType);
    }

    if (filters.cellGroupId) {
      query = query.eq('cell_group_id', filters.cellGroupId);
    }

    if (filters.searchTerm) {
      query = query.or(
        `full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`
      );
    }

    return from(query).pipe(
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Obter membros por status
   */
  getMembersByStatus(status: string): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(
      client
        .from('members')
        .select('*')
        .eq('status', status)
        .order('full_name', { ascending: true })
    ).pipe(
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Obter membros por tipo
   */
  getMembersByType(memberType: string): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(
      client
        .from('members')
        .select('*')
        .eq('member_type', memberType)
        .eq('status', 'active')
        .order('full_name', { ascending: true })
    ).pipe(
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Obter membros por célula
   */
  getMembersByCellGroup(cellGroupId: string): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(
      client
        .from('members')
        .select('*')
        .eq('cell_group_id', cellGroupId)
        .eq('status', 'active')
        .order('full_name', { ascending: true })
    ).pipe(
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Contar membros por status
   */
  countMembersByStatus(): Observable<{ [key: string]: number }> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of({});
    }

    return from(client.from('members').select('status')).pipe(
      map((response) => {
        const counts: { [key: string]: number } = {
          active: 0,
          inactive: 0,
          member: 0,
          visitor: 0,
        };

        (response.data as any[])?.forEach((member) => {
          if (member.status in counts) {
            counts[member.status]++;
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
   * Obter aniversariantes do mês
   */
  getMembersWithBirthdayThisMonth(): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client) {
      return of([]);
    }

    return from(
      client.from('members').select('*').eq('status', 'active').eq('receive_notifications', true)
    ).pipe(
      map((response) => {
        const members = (response.data as Member[]) || [];
        const today = new Date();
        const currentMonth = today.getMonth();

        return members.filter((member) => {
          if (!member.birth_date) return false;
          const birthDate = new Date(member.birth_date);
          return birthDate.getMonth() === currentMonth;
        });
      }),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Exportar membros para CSV
   */
  exportMembersToCSV(): Observable<Blob> {
    return this.getAllMembers(1000).pipe(
      map((members) => {
        const headers = [
          'ID',
          'Nome',
          'Email',
          'Telefone',
          'Data de Nascimento',
          'Status',
          'Tipo',
          'Data de Ingresso',
        ];

        const rows = members.map((member) => [
          member.id || '',
          member.full_name,
          member.email || '',
          member.phone || '',
          member.birth_date || '',
          member.status || '',
          member.member_type || '',
          member.join_date || '',
        ]);

        const csv = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');

        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      })
    );
  }

  /**
   * Sincronizar membros locais com database
   */
  syncLocalMembers(localMembers: Member[]): Observable<Member[]> {
    const client = this.supabaseInit.getClient();
    if (!client || localMembers.length === 0) {
      return of([]);
    }

    const membersToSync = localMembers.map((m) => ({
      ...m,
      church_id: 'church-1',
      status: m.status || 'active',
    }));

    return from(client.from('members').upsert(membersToSync, { onConflict: 'id' }).select()).pipe(
      tap(() => {
        this.errorSubject.next(null);
        this.getAllMembers().subscribe();
      }),
      map((response) => (response.data as Member[]) || []),
      catchError((error) => {
        this.errorSubject.next(error.message);
        return of([]);
      })
    );
  }

  /**
   * Obter estatísticas de membros
   */
  getMembersStatistics(): Observable<{
    total: number;
    active: number;
    inactive: number;
    visitors: number;
    leaders: number;
  }> {
    return this.getAllMembers(10000).pipe(
      map((members) => ({
        total: members.length,
        active: members.filter((m) => m.status === 'active').length,
        inactive: members.filter((m) => m.status === 'inactive').length,
        visitors: members.filter((m) => m.member_type === 'visitor').length,
        leaders: members.filter((m) => m.member_type === 'leader').length,
      }))
    );
  }

  /**
   * Limpar erro
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
