import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthContext } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new BehaviorSubject<AuthContext>({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  public auth$ = this.authSubject.asObservable();

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const storedAuth = localStorage.getItem('auth_context');
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        this.authSubject.next(auth);
      } catch (e) {
        console.error('Error loading stored auth:', e);
      }
    }
  }

  login(email: string, password: string): Observable<AuthContext> {
    // TODO: Integrar com Supabase
    return new Observable(subscriber => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email,
          name: 'Admin User',
          role: 'admin',
          churchId: 'church-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const auth: AuthContext = {
          user: mockUser,
          isAuthenticated: true,
          token: 'mock-token-123',
        };

        localStorage.setItem('auth_context', JSON.stringify(auth));
        this.authSubject.next(auth);
        subscriber.next(auth);
        subscriber.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('auth_context');
    this.authSubject.next({
      user: null,
      isAuthenticated: false,
      token: null,
    });
  }

  getCurrentUser(): User | null {
    return this.authSubject.value.user;
  }

  isAuthenticated(): boolean {
    return this.authSubject.value.isAuthenticated;
  }

  getToken(): string | null {
    return this.authSubject.value.token;
  }
}
