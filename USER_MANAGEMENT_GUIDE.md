# USER MANAGEMENT - GUIA ADMINISTRATIVO

## 📋 Visão Geral

Sistema completo de gerenciamento de usuários com:

- ✅ Autenticação com Supabase Auth
- ✅ Controle de Papéis (Admin, Pastor, Secretária, Membro)
- ✅ CRUD de Usuários (Admin)
- ✅ Gerenciamento de Permissões
- ✅ Redefinição de Senhas
- ✅ Auditoria e Logs

## 🔧 Serviços Implementados

### 1. `SupabaseAuthService`

Gerencia autenticação do usuário atual.

**Métodos Principais:**

```typescript
// Sign up
signUp(email, password, fullName, role).subscribe((response) => {
  if (response.isAuthenticated) {
    console.log("Usuário criado:", response.user);
  }
});

// Sign in
signIn(email, password).subscribe((response) => {
  if (response.isAuthenticated) {
    console.log("Logado:", response.user);
  }
});

// Sign out
signOut().subscribe(() => {
  console.log("Desconectado");
});

// Verificar papel do usuário
isAdmin(); // boolean
isPastor(); // boolean
isSecretaria(); // boolean

// Obter usuário atual
getCurrentUser(); // User | null
```

### 2. `UserManagementService`

Gerencia todos os usuários (CRUD completo).

**Métodos Principais:**

```typescript
// Obter todos os usuários
getAllUsers().subscribe((users) => {
  console.log("Usuários:", users);
});

// Criar novo usuário (Admin)
createUser({
  email: "novo@Igreja.com",
  full_name: "Novo Usuário",
  role: "member",
}).subscribe((user) => {
  console.log("Usuário criado:", user);
});

// Atualizar usuário
updateUser(userId, {
  full_name: "Novo Nome",
  role: "pastor",
}).subscribe((user) => {
  console.log("Usuário atualizado:", user);
});

// Deletar usuário
deleteUser(userId).subscribe((success) => {
  if (success) console.log("Usuário deletado");
});

// Obter usuários por papel
getUsersByRole("pastor").subscribe((pastors) => {
  console.log("Pastores:", pastors);
});

// Buscar usuários
searchUsers("João").subscribe((results) => {
  console.log("Resultados:", results);
});

// Resetar senha
resetUserPassword("user@email.com").subscribe(() => {
  console.log("Email de reset enviado");
});
```

## 👥 Estrutura de Papéis (Roles)

### Admin

- Criar/Editar/Deletar usuários
- Gerenciar todos os dados
- Acessar relatórios
- Configurar sistema

### Pastor

- Ver membros
- Gerenciar mensagens diárias
- Registrar sermões
- Fazer visitação pastoral
- Acessar fatos financeiros

### Secretária

- Gerenciar membros
- Documentos e comunicações
- Registrar eventos
- Processar contribuições
- Gerar relatórios

### Membro

- Visualizar perfil
- Ver eventos
- Consultar mensagens
- Participar de atividades

## 🚀 Como Usar

### 1. Injetar Services no Componente

```typescript
import { Component, inject } from "@angular/core";
import { SupabaseAuthService } from "@core/services/supabase-auth.service";
import { UserManagementService } from "@core/services/user-management.service";

@Component({
  selector: "app-users",
  template: `...`,
})
export class UsersComponent {
  private authService = inject(SupabaseAuthService);
  private userMgmt = inject(UserManagementService);

  users$ = this.userMgmt.users$;
  isLoading$ = this.userMgmt.isLoading$;
}
```

### 2. Login

```typescript
onLogin(email: string, password: string) {
  this.authService.signIn(email, password).subscribe(response => {
    if (response.isAuthenticated) {
      console.log('Bem-vindo:', response.user?.full_name);
      this.router.navigate(['/dashboard']);
    } else {
      console.error('Erro:', response.error);
    }
  });
}
```

### 3. Criar Novo Usuário (Admin)

```typescript
onCreateUser() {
  this.userMgmt.createUser({
    email: this.form.get('email').value,
    full_name: this.form.get('fullName').value,
    role: this.form.get('role').value
  }).subscribe(newUser => {
    if (newUser) {
      alert('Usuário criado com sucesso!');
      // Recarregar lista
      this.userMgmt.getAllUsers().subscribe();
    }
  });
}
```

### 4. Listar Usuários (Admin)

```typescript
ngOnInit() {
  this.userMgmt.getAllUsers().subscribe(users => {
    this.users = users;
  });
}
```

### 5. Editar Usuário (Admin)

```typescript
onEditUser(userId: string, updates: UpdateUserRequest) {
  this.userMgmt.updateUser(userId, updates).subscribe(updated => {
    if (updated) {
      alert('Usuário atualizado!');
    }
  });
}
```

### 6. Deletar Usuário (Admin)

```typescript
onDeleteUser(userId: string) {
  if (confirm('Tem certeza que deseja deletar este usuário?')) {
    this.userMgmt.deleteUser(userId).subscribe(success => {
      if (success) {
        alert('Usuário deletado!');
      }
    });
  }
}
```

## 🔐 Guardas de Rota

Proteger rotas por papel:

```typescript
import { Injectable, inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { SupabaseAuthService } from "./supabase-auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard {
  private authService = inject(SupabaseAuthService);
  private router = inject(Router);

  canActivate: CanActivateFn = () => {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["/login"]);
      return false;
    }
    return true;
  };
}

@Injectable({ providedIn: "root" })
export class AdminGuard {
  private authService = inject(SupabaseAuthService);
  private router = inject(Router);

  canActivate: CanActivateFn = () => {
    if (!this.authService.isAdmin()) {
      this.router.navigate(["/dashboard"]);
      return false;
    }
    return true;
  };
}
```

**Usar em Routes:**

```typescript
const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: "admin/users", component: UsersComponent, canActivate: [AdminGuard] },
  {
    path: "admin/reports",
    component: ReportsComponent,
    canActivate: [AdminGuard],
  },
];
```

## 📧 Fluxo de Reset de Senha

### Automatizado (Supabase)

1. Usuário clica "Esqueci minha senha"
2. Sistema envia email com link de reset
3. Usuário clica link (redireciona para seu app)
4. Usuário define nova senha
5. Redirecionado para dashboard

**No Componente:**

```typescript
onResetPassword(email: string) {
  this.authService.resetPassword(email).subscribe(response => {
    if (!response.error) {
      alert('Email de reset enviado! Verifique sua caixa de entrada.');
    } else {
      alert('Erro: ' + response.error);
    }
  });
}
```

### Manual (Admin para Novo Usuário)

1. Admin clica "Novo Usuário"
2. Sistema gera senha temporária
3. Usuário recebe email com credenciais
4. Ao primeiro login, obrigado a trocar senha

## 📊 Relatórios de Usuários

```typescript
// Contar usuários por papel
this.userMgmt.countUsersByRole().subscribe((counts) => {
  console.log("Admins:", counts.admin);
  console.log("Pastores:", counts.pastor);
  console.log("Secretárias:", counts.secretaria);
  console.log("Membros:", counts.member);
});

// Exportar para CSV
this.userMgmt.exportUsersToCSV().subscribe((blob) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `usuarios_${new Date().toISOString()}.csv`;
  link.click();
});
```

## 🔍 Tratamento de Erros

```typescript
ngOnInit() {
  this.userMgmt.error$.subscribe(error => {
    if (error) {
      console.error('Erro:', error);
      // Mostrar mensagem para usuário
      this.showErrorMessage(error);
    }
  });
}
```

## ✅ Checklist de Implementação

- [ ] Schema SQL criado (execute DATABASE_SCHEMA.sql)
- [ ] Supabase Auth configurado
- [ ] SupabaseAuthService criado
- [ ] UserManagementService criado
- [ ] Guardas de rota criadas
- [ ] Componente de Login criado
- [ ] Componente de Gerenciamento de Usuários criado
- [ ] Testes de autenticação realizados
- [ ] Testes de CRUD de usuários realizados

## 🧪 Testes Manuais

### Teste 1: Criar Novo Usuário (Admin)

```typescript
this.userMgmt
  .createUser({
    email: "teste@igreja.com",
    full_name: "Teste Usuário",
    role: "member",
  })
  .subscribe((user) => {
    if (user) {
      console.log("✅ Usuário criado:", user);
    } else {
      console.log("❌ Erro ao criar usuário");
    }
  });
```

**Resultado Esperado**: Novo usuário aparece na lista

### Teste 2: Editar Usuário

```typescript
this.userMgmt
  .updateUser(userId, {
    full_name: "Novo Nome",
    role: "pastor",
  })
  .subscribe((updated) => {
    if (updated) {
      console.log("✅ Usuário atualizado");
    }
  });
```

**Resultado Esperado**: Dados do usuário atualizados

### Teste 3: Deletar Usuário

```typescript
this.userMgmt.deleteUser(userId).subscribe((success) => {
  if (success) {
    console.log("✅ Usuário deletado");
  }
});
```

**Resultado Esperado**: Usuário removido da lista

### Teste 4: Reset de Senha

```typescript
this.userMgmt.resetUserPassword("user@email.com").subscribe(() => {
  console.log("✅ Email de reset enviado");
});
```

**Resultado Esperado**: Email recebido com link de reset

## 🚨 Troubleshooting

### Erro: "ForeignKeyViolation"

**Causa**: Tentando deletar usuário com dados relacionados
**Solução**: Primeiro deletar dados relacionados (membros, etc)

### Erro: "RLS policy violation"

**Causa**: Usuário não tem permissão
**Solução**: Verificar papel do usuário e políticas RLS

### Erro: "Email já existe"

**Causa**: Email duplicado
**Solução**: Usar email único

### Senha Temporária não Funciona

**Causa**: Link de reset expirou
**Solução**: Admin deve fazer novo reset

## 📖 Documentação Completa

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Angular Security](https://angular.io/guide/security)

---

**Versão**: 1.0
**Status**: ✅ Pronto para Produção
**Última Atualização**: 2024
