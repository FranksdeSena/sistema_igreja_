import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User as FirebaseUser, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

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
export class FirebaseAuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
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

  private initializeAuth(): void {
    authState(this.auth).subscribe((firebaseUser) => {
      if (firebaseUser) {
        this.mapFirebaseUserToAppUser(firebaseUser).then(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.isLoadingSubject.next(false);
        });
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.isLoadingSubject.next(false);
      }
    });
  }

  private async mapFirebaseUserToAppUser(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as any;
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: userData.full_name || firebaseUser.displayName || 'Usuário',
          role: userData.role || 'member',
          is_active: userData.is_active !== false,
          created_at: userData.created_at || firebaseUser.metadata.creationTime || new Date().toISOString()
        };
      }

      // Fallback para admin inicial frme@ibn.com se não existir no banco
      const role = firebaseUser.email === 'frme@ibn.com' ? 'admin' : 'member';
      
      // Se for o admin inicial e não existir no banco, tenta criar o registro
      // mas não bloqueia o login se falhar
      if (role === 'admin') {
        const newAdminData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: 'Administrador',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        };
        
        // Tenta criar mas não espera/bloqueia se falhar
        setDoc(userDocRef, newAdminData).catch(err => {
          console.warn('Não foi possível criar registro do admin no Firestore:', err);
        });
        
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: 'Administrador',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        };
      }

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: firebaseUser.displayName || 'Usuário',
        role: role,
        is_active: true,
        created_at: firebaseUser.metadata.creationTime || new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário no Firestore:', error);
      
      // Em caso de erro, retorna dados básicos do Firebase Auth
      const role = firebaseUser.email === 'frme@ibn.com' ? 'admin' : 'member';
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: firebaseUser.displayName || (role === 'admin' ? 'Administrador' : 'Usuário'),
        role: role,
        is_active: true,
        created_at: firebaseUser.metadata.creationTime || new Date().toISOString()
      };
    }
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential) => {
        return from(this.mapFirebaseUserToAppUser(credential.user)).pipe(
          map(user => ({
            user,
            error: null,
            isAuthenticated: true
          }))
        );
      }),
      catchError((error) => {
        console.error('Erro no login Firebase:', error);
        let errorMessage = 'Falha ao fazer login';
        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        }
        return of({
          user: null,
          error: errorMessage,
          isAuthenticated: false
        });
      })
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.router.navigate(['/auth/login']);
      })
    );
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
}
