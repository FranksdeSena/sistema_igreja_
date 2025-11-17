import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private membersSubject = new BehaviorSubject<Member[]>([
    {
      id: '1',
      churchId: 'church-1',
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      phone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321',
      birthDate: new Date(1990, 10, 16),
      joinDate: new Date(2020, 5, 15),
      cellId: 'cell-1',
      status: 'active',
      role: 'Líder',
      photo: '👩‍🦱',
      address: 'Rua A, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      churchId: 'church-1',
      name: 'João Santos',
      email: 'joao@exemplo.com',
      phone: '(11) 99876-5432',
      whatsapp: '(11) 99876-5432',
      birthDate: new Date(1985, 8, 18),
      joinDate: new Date(2019, 2, 10),
      cellId: 'cell-2',
      status: 'active',
      role: 'Membro',
      photo: '👨‍💼',
      address: 'Rua B, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-890',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      churchId: 'church-1',
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      phone: '(11) 97654-3210',
      whatsapp: '(11) 97654-3210',
      birthDate: new Date(1988, 10, 21),
      joinDate: new Date(2021, 0, 5),
      cellId: 'cell-1',
      status: 'active',
      role: 'Membro',
      photo: '👩‍🎓',
      address: 'Rua C, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-111',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  public members$ = this.membersSubject.asObservable();

  constructor() {}

  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getMemberById(id: string): Observable<Member | undefined> {
    return new Observable((observer) => {
      const member = this.membersSubject.value.find((m) => m.id === id);
      observer.next(member);
      observer.complete();
    });
  }

  addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Observable<Member> {
    return new Observable((observer) => {
      const newMember: Member = {
        ...member,
        id: `member-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const current = this.membersSubject.value;
      this.membersSubject.next([...current, newMember]);
      observer.next(newMember);
      observer.complete();
    });
  }

  updateMember(id: string, member: Partial<Member>): Observable<Member | null> {
    return new Observable((observer) => {
      const current = this.membersSubject.value;
      const index = current.findIndex((m) => m.id === id);

      if (index === -1) {
        observer.next(null);
        observer.complete();
        return;
      }

      const updated: Member = {
        ...current[index],
        ...member,
        updatedAt: new Date(),
      };

      current[index] = updated;
      this.membersSubject.next([...current]);
      observer.next(updated);
      observer.complete();
    });
  }

  deleteMember(id: string): Observable<boolean> {
    return new Observable((observer) => {
      const current = this.membersSubject.value;
      const filtered = current.filter((m) => m.id !== id);

      if (filtered.length === current.length) {
        observer.next(false);
      } else {
        this.membersSubject.next(filtered);
        observer.next(true);
      }

      observer.complete();
    });
  }

  searchMembers(query: string): Observable<Member[]> {
    return new Observable((observer) => {
      const query_lower = query.toLowerCase();
      const filtered = this.membersSubject.value.filter(
        (m) =>
          m.name.toLowerCase().includes(query_lower) ||
          m.email.toLowerCase().includes(query_lower) ||
          m.phone.includes(query)
      );
      observer.next(filtered);
      observer.complete();
    });
  }
}
