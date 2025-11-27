// Usuário do sistema
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pastor' | 'secretaria' | 'member';
  churchId: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Permissões do usuário
export interface Permission {
  id: string;
  userId: string;
  resource: string;
  action: 'read' | 'create' | 'update' | 'delete';
  granted: boolean;
}

// Contexto de autenticação
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
