import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc, query, getDocs } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, updateProfile, user } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { map, switchMap, catchError, take, tap } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pastor' | 'secretaria' | 'member';
  created_at: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  constructor() {}

  /**
   * Lista todos os usuários
   */
  getUsers(): Observable<UserProfile[]> {
    console.log('🔍 Buscando usuários no Firestore...');
    const usersCollection = collection(this.firestore, 'users');
    const usersQuery = query(usersCollection);
    
    return from(getDocs(usersQuery)).pipe(
      map(snapshot => {
        const users = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as UserProfile));
        console.log('✅ Usuários retornados do Firestore:', users);
        return users;
      }),
      catchError(err => {
        console.error('❌ Erro ao buscar usuários:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtém um usuário pelo ID
   */
  getUserById(uid: string): Observable<UserProfile | undefined> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return docData(userDoc) as Observable<UserProfile | undefined>;
  }

  /**
   * Cria um novo usuário
   * Usa initializeApp secundário para criar usuário sem deslogar o admin atual
   */
  async createUser(userData: Omit<UserProfile, 'uid' | 'created_at'>, password: string): Promise<void> {
    // Importar dinamicamente para criar app secundário
    const { initializeApp, deleteApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const { environment } = await import('../../../environments/environment');
    
    // Criar app secundário temporário para não deslogar o admin
    const secondaryApp = initializeApp(environment.firebase, 'Secondary');
    const secondaryAuth = getAuth(secondaryApp);
    
    try {
      // 1. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        userData.email,
        password
      );
      
      // 2. Salvar dados complementares no Firestore
      const userDoc = doc(this.firestore, `users/${userCredential.user.uid}`);
      const userProfileData: UserProfile = {
        ...userData,
        uid: userCredential.user.uid,
        created_at: new Date().toISOString(),
        is_active: true
      };
      
      await setDoc(userDoc, userProfileData);
      
      // 3. Fazer logout do app secundário e deletá-lo
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);
      
    } catch (error: any) {
      // Limpar app secundário em caso de erro
      try {
        await secondaryAuth.signOut();
        const { deleteApp } = await import('firebase/app');
        await deleteApp(secondaryApp);
      } catch (cleanupError) {
        console.error('Erro ao limpar app secundário:', cleanupError);
      }
      
      // Propagar erro com mensagem amigável
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email já está em uso');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      throw new Error('Erro ao criar usuário: ' + error.message);
    }
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDoc, data);
  }

  /**
   * Remove usuário (apenas do Firestore por enquanto)
   */
  async deleteUser(uid: string): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userDoc);
  }

  /**
   * Verifica se o usuário atual tem permissão de admin
   */
  isAdmin(uid: string): Observable<boolean> {
    return this.getUserById(uid).pipe(
      map(user => user?.role === 'admin')
    );
  }
}
