import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, signOut, User as FirebaseUser, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

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
  private auditService = inject(AuditService);

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

  // Chave do localStorage para o ID da sessão
  private readonly SESSION_KEY = 'user_session_id';

  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential) => {
        return from(this.mapFirebaseUserToAppUser(credential.user)).pipe(
          switchMap(async (user) => {
            // Criar nova sessão após login bem-sucedido
            await this.createSession(user.id);
            return {
              user,
              error: null,
              isAuthenticated: true
            };
          }),
          tap(async (response) => {
            if (response.user) {
              await this.auditService.logAction({
                userId: response.user.id,
                userName: response.user.full_name,
                userEmail: response.user.email,
                action: 'LOGIN',
                module: 'auth',
                entityId: response.user.id,
                description: 'Login realizado com sucesso'
              });
            }
          }),
          catchError((error) => {
            console.error('Erro no processo de login:', error);
            return of({
              user: null,
              error: 'Erro ao processar dados do usuário',
              isAuthenticated: false
            });
          })
        );
      }),
      catchError((error) => {
        console.error('Erro no login Firebase:', error);
        let errorMessage = 'Falha ao fazer login';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
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

  async signOut(): Promise<void> {
    const user = this.currentUserSubject.value;
    if (user) {
      await this.clearSession(user.id);
      await this.auditService.logAction({
        userId: user.id,
        userName: user.full_name,
        userEmail: user.email,
        action: 'LOGOUT',
        module: 'auth',
        entityId: user.id,
        description: 'Logout realizado'
      });
    }
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  // --- Gestão de Sessão ---

  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback simples
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private async createSession(userId: string): Promise<void> {
    const sessionId = this.generateSessionId();
    const sessionRef = doc(this.firestore, `users/${userId}/session/current`);
    
    const sessionData = {
      sessionId,
      userId,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      deviceInfo: navigator.userAgent
    };

    await setDoc(sessionRef, sessionData);
    localStorage.setItem(this.SESSION_KEY, sessionId);
  }

  private async clearSession(userId: string): Promise<void> {
    localStorage.removeItem(this.SESSION_KEY);
    // Opcional: Limpar no Firestore também se quiser
  }

  // Verifica se a sessão local corresponde à sessão no Firestore
  async validateSession(): Promise<boolean> {
    const user = this.currentUserSubject.value;
    if (!user) return true; // Se não tá logado, ignora

    const localSessionId = localStorage.getItem(this.SESSION_KEY);
    if (!localSessionId) return false; // Tem user mas não tem sessão local

    try {
      const sessionRef = doc(this.firestore, `users/${user.id}/session/current`);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const remoteSession = sessionSnap.data();
        // Se o ID remoto for diferente do local, significa que outro login sobrescreveu
        return remoteSession['sessionId'] === localSessionId;
      }
      return false; // Sessão não existe no servidor
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return true; // Fail open para não bloquear em erro de rede
    }
  }
}
