# INTEGRAÇÃO COMPLETA - BANCO DE DADOS + AUTENTICAÇÃO

## 📋 Resumo do Que Foi Implementado

✅ **Schema SQL Completo** - 14 tabelas com relacionamentos
✅ **Supabase Auth** - Sistema de autenticação integrado
✅ **SupabaseAuthService** - Gerenciamento de sessão do usuário
✅ **UserManagementService** - CRUD de usuários (admin)
✅ **MembersDatabaseService** - CRUD de membros
✅ **RLS Policies** - Segurança em nível de linha
✅ **Triggers & Functions** - Auditoria automática

---

## 🚀 PASSO 1: EXECUTAR O SCHEMA SQL

### No Supabase Dashboard:

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor** → **New Query**
4. Copie TODO o conteúdo de `DATABASE_SCHEMA.sql`
5. Execute (Ctrl+Enter ou clique em "Run")

**Tempo esperado**: 5-15 segundos

**Verificar sucesso**:

```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
-- Deve retornar: 14
```

---

## 🔑 PASSO 2: CRIAR USUÁRIOS INICIAIS

### Via SQL Editor do Supabase:

```sql
-- Usuário ADMIN
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  'admin@igreja.com',
  now(),
  '{"name": "Administrador"}',
  '{"role": "admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Usuário PASTOR
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  'pastor@igreja.com',
  now(),
  '{"name": "Pastor João"}',
  '{"role": "pastor"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Usuário SECRETÁRIA
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  'secretaria@igreja.com',
  now(),
  '{"name": "Secretária Maria"}',
  '{"role": "secretaria"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
);
```

Depois, adicione os usuários na tabela `public.users`:

```sql
-- Obter IDs dos usuários criados
SELECT id, email FROM auth.users WHERE email IN ('admin@igreja.com', 'pastor@igreja.com', 'secretaria@igreja.com');

-- Inserir na tabela public.users (substitua os IDs)
INSERT INTO public.users (id, email, full_name, role, is_active) VALUES
('UUID_DO_ADMIN', 'admin@igreja.com', 'Administrador', 'admin', true),
('UUID_DO_PASTOR', 'pastor@igreja.com', 'Pastor João', 'pastor', true),
('UUID_DA_SECRETARIA', 'secretaria@igreja.com', 'Secretária Maria', 'secretaria', true);
```

---

## 🔧 PASSO 3: VERIFICAR AMBIENTE ANGULAR

Confirme que estes arquivos já foram criados:

✅ `src/app/core/services/supabase-init.service.ts` - Inicialização
✅ `src/app/core/services/supabase-auth.service.ts` - **Autenticação** (NOVO)
✅ `src/app/core/services/user-management.service.ts` - **Gerenciamento de Usuários** (NOVO)
✅ `src/app/core/services/members-database.service.ts` - **Membros** (NOVO)
✅ `src/app/core/services/supabase-media.service.ts` - Mídia
✅ `src/environments/environment.ts` - Com credenciais Supabase

---

## 💾 PASSO 4: ATUALIZAR ARQUIVO DE BANCO DE DADOS

Se precisar, crie um serviço auxiliar para outras entidades:

```typescript
// src/app/core/services/finances-database.service.ts
import { Injectable, inject } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { SupabaseInitService } from "./supabase-init.service";

export interface Finance {
  id?: string;
  type: "tithe" | "offering" | "expense" | "other";
  amount: number;
  description: string;
  recorded_by: string;
  recorded_date: string;
  payment_method?: string;
  created_at?: string;
}

@Injectable({ providedIn: "root" })
export class FinancesDatabaseService {
  private supabaseInit = inject(SupabaseInitService);

  createFinance(finance: Finance): Observable<Finance | null> {
    const client = this.supabaseInit.getClient();
    if (!client) return of(null);

    return from(
      client.from("finances").insert([finance]).select().single()
    ).pipe(
      map((response) => (response.data as Finance) || null),
      catchError(() => of(null))
    );
  }

  getFinances(limit = 100): Observable<Finance[]> {
    const client = this.supabaseInit.getClient();
    if (!client) return of([]);

    return from(
      client
        .from("finances")
        .select("*")
        .order("recorded_date", { ascending: false })
        .limit(limit)
    ).pipe(
      map((response) => (response.data as Finance[]) || []),
      catchError(() => of([]))
    );
  }
}
```

---

## 🎯 PASSO 5: CRIAR COMPONENTE DE LOGIN

Crie `src/app/auth/login.component.ts`:

```typescript
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { SupabaseAuthService } from "@core/services/supabase-auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <h2>Login - Sistema Igreja</h2>

      <form (ngSubmit)="onLogin()">
        <div class="form-group">
          <label>Email:</label>
          <input type="email" [(ngModel)]="email" name="email" required />
        </div>

        <div class="form-group">
          <label>Senha:</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
          />
        </div>

        <button type="submit" [disabled]="isLoading">
          {{ isLoading ? "Entrando..." : "Entrar" }}
        </button>

        <p class="error" *ngIf="error">{{ error }}</p>
      </form>

      <p>Credenciais de teste:</p>
      <ul>
        <li>admin@igreja.com (admin)</li>
        <li>pastor@igreja.com (pastor)</li>
        <li>secretaria@igreja.com (secretária)</li>
      </ul>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
      }
      input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      button {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .error {
        color: red;
        margin-top: 10px;
      }
    `,
  ],
})
export class LoginComponent {
  private authService = inject(SupabaseAuthService);
  private router = inject(Router);

  email = "";
  password = "";
  isLoading = false;
  error = "";

  onLogin(): void {
    this.isLoading = true;
    this.error = "";

    this.authService.signIn(this.email, this.password).subscribe((response) => {
      this.isLoading = false;

      if (response.isAuthenticated) {
        console.log("✅ Login realizado:", response.user);
        this.router.navigate(["/dashboard"]);
      } else {
        this.error = response.error || "Erro ao fazer login";
        console.error("❌ Erro:", this.error);
      }
    });
  }
}
```

---

## 🛡️ PASSO 6: CRIAR GUARD DE AUTENTICAÇÃO

Crie `src/app/auth/auth.guard.ts`:

```typescript
import { Injectable, inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { SupabaseAuthService } from "@core/services/supabase-auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuardService {
  private authService = inject(SupabaseAuthService);
  private router = inject(Router);

  canActivate: CanActivateFn = () => {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  };
}

@Injectable({ providedIn: "root" })
export class AdminGuardService {
  private authService = inject(SupabaseAuthService);
  private router = inject(Router);

  canActivate: CanActivateFn = () => {
    if (this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(["/dashboard"]);
      return false;
    }
  };
}
```

---

## 🗺️ PASSO 7: ATUALIZAR ROTAS

Atualize `src/app/app.routes.ts`:

```typescript
import { Routes } from "@angular/router";
import { LoginComponent } from "@auth/login.component";
import { AuthGuardService, AdminGuardService } from "@auth/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },

  // Rotas públicas
  { path: "login", component: LoginComponent },

  // Rotas protegidas
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "members",
    component: MembersComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "finance",
    component: FinanceComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "events",
    component: EventsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "pastor",
    component: PastorComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "secretaria",
    component: SecretariaComponent,
    canActivate: [AuthGuardService],
  },

  // Rotas admin only
  {
    path: "admin/users",
    component: UsersComponent,
    canActivate: [AdminGuardService],
  },
  {
    path: "admin/reports",
    component: AdminReportsComponent,
    canActivate: [AdminGuardService],
  },
];
```

---

## 📱 PASSO 8: TESTE DE INTEGRAÇÃO

No console do navegador (F12), teste:

```javascript
// 1. Verificar se Supabase foi inicializado
console.log("Supabase inicializado:", typeof supabase !== "undefined");

// 2. Testar conexão com banco
const { data, error } = await supabase.from("members").select().limit(1);
console.log("Conexão com banco:", { data, error });

// 3. Verificar autenticação
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Usuário atual:", user);
```

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Schema SQL executado (14 tabelas criadas)
- [ ] Usuários de teste criados (admin, pastor, secretária)
- [ ] SupabaseAuthService criado
- [ ] UserManagementService criado
- [ ] MembersDatabaseService criado
- [ ] LoginComponent criado
- [ ] AuthGuard criado
- [ ] Rotas atualizadas
- [ ] Testes de conexão realizados
- [ ] npm start rodando sem erros

---

## 🚀 PRÓXIMAS AÇÕES

### Imediato:

1. Execute o SQL schema
2. Crie os usuários de teste
3. Teste o login

### Curto Prazo:

1. Criar componente de gerenciamento de usuários (admin)
2. Criar componente de gerenciamento de membros
3. Implementar dashboard com estatísticas

### Médio Prazo:

1. Criar componentes de finanças
2. Criar componentes de eventos
3. Criar componentes de comunicações

---

## 📊 ESTRUTURA DE DADOS

### Tabelas Principais:

```
users (Autenticação + Perfil)
├── members (Cadastro de Membros)
├── finances (Contribuições)
├── events (Eventos e Atividades)
├── communications (Mensagens)
├── documents (Arquivos)
├── sermons (Sermões)
├── daily_messages (Palavra do Pastor)
├── pastoral_visits (Visitação)
├── media (Fotos e Vídeos)
└── reports (Relatórios)
```

---

## 🔐 SEGURANÇA

✅ **RLS Policies** - Dados protegidos por função
✅ **Credenciais** - Em environment.ts (não em git)
✅ **Auth Tokens** - Gerenciados por Supabase
✅ **Auditing** - Timestamps automáticos
✅ **CRUD Permissions** - Baseados em papéis

---

## 📞 SUPORTE

- **Docs Supabase**: https://supabase.com/docs
- **Angular Security**: https://angular.io/guide/security
- **GitHub**: Consulte commits para exemplo de código

---

**Status**: ✅ **PRONTO PARA USAR**
**Data**: 2024
**Versão**: 1.0 - Production Ready
