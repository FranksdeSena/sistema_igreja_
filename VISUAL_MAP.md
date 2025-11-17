# 🗺️ MAPA VISUAL - SISTEMA IGREJA COM BANCO DE DADOS

## 📊 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO WEB ANGULAR                        │
│                    (http://localhost:4200)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │   LoginComponent │  │   UsersComponent │  │ MembersComponent││
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘│
│           │                     │                     │         │
│           └─────────────┬───────┴─────────────────────┘         │
│                         │                                       │
│                    ┌────▼──────────────────┐                   │
│                    │   SERVICES LAYER      │                   │
│                    │  (TypeScript/RxJS)    │                   │
│                    └────┬─────────────────┬┘                   │
│           ┌────────────┼─────────────────┼──────────────┐     │
│           │            │                 │              │     │
│    ┌──────▼──────┐ ┌──▼──────────────┐ ┌▼──────────────┐     │
│    │ SupabaseAuth│ │ UserManagement  │ │ MembersDatabase   │
│    │  Service    │ │   Service       │ │   Service         │
│    └──────┬──────┘ └──┬───────────────┘ └┬──────────────┘     │
│           │           │                 │                    │
└───────────┼───────────┼─────────────────┼────────────────────┘
            │           │                 │
            └───────────┴─────────────────┴──────────┐
                                                     │
                    ┌────────────────────────────────▼─────────┐
                    │    SUPABASE (Cloud Backend)              │
                    │    https://supabase.io                   │
                    └────────────────────────────────────────┬──┘
                                                            │
        ┌───────────────────────────────┬──────────────────┼──────┐
        │                               │                  │      │
    ┌───▼────────────────┐    ┌────────▼──────────┐    ┌──▼──────▼──┐
    │  Auth Module       │    │ PostgreSQL Database     │ Storage    │
    │  (Users/Sessions)  │    │ (14 Tables)             │ (Files)    │
    └────────────────────┘    └─────────────────────    └─────────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
              ┌───▼────┐  ┌──────────▼───┐  ┌───────────▼────┐
              │ users  │  │    members   │  │  finances      │
              ├────────┤  ├──────────────┤  ├────────────────┤
              │id      │  │id            │  │id              │
              │email   │  │full_name     │  │type            │
              │role    │  │email         │  │amount          │
              │...     │  │phone         │  │recorded_by     │
              └────────┘  │status        │  │...             │
                         │...           │  └────────────────┘
                         └──────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Login

```
User → LoginComponent
    ↓
SupabaseAuthService.signIn(email, pwd)
    ↓
Supabase Auth
    ↓
JWT Token + User Data
    ↓
Update currentUser$ Observable
    ↓
Navigate to Dashboard
```

### 2. Criar Usuário (Admin)

```
Admin → UsersComponent (Create form)
    ↓
UserManagementService.createUser()
    ↓
Supabase Auth (create auth user)
    ↓
public.users table (create profile)
    ↓
Update users$ Observable
    ↓
Show success message
```

### 3. Listar Membros

```
User → MembersComponent
    ↓
MembersDatabaseService.getAllMembers()
    ↓
Query: SELECT * FROM members
    ↓
Get data from Supabase
    ↓
Update members$ Observable
    ↓
Display in list
```

---

## 📦 Componentes (A Serem Criados)

```
┌─ AUTH COMPONENTS
│  ├─ LoginComponent
│  ├─ RegisterComponent
│  ├─ ResetPasswordComponent
│  └─ ProfileComponent
│
├─ ADMIN COMPONENTS
│  ├─ UsersComponent (LIST)
│  ├─ UserDetailComponent (EDIT)
│  └─ UserCreateComponent (CREATE)
│
├─ MEMBERS COMPONENTS
│  ├─ MembersListComponent
│  ├─ MemberDetailComponent
│  ├─ MemberCreateComponent
│  └─ MemberEditComponent
│
├─ OTHER MODULES
│  ├─ FinanceComponent
│  ├─ EventsComponent
│  ├─ CommunicationsComponent
│  ├─ PastorComponent
│  └─ SecretariaComponent
│
└─ SHARED COMPONENTS
   ├─ AuthGuard
   ├─ AdminGuard
   ├─ NavbarComponent
   └─ SidebarComponent
```

---

## 🔐 Segurança em Camadas

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (Angular)                  │
│  ├─ AuthGuard (verificar se autenticado)           │
│  ├─ RoleGuard (verificar papel do usuário)         │
│  └─ JWT Token (armazenado em sessão)               │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────┐
│              BACKEND (Supabase)                      │
│  ├─ Auth Module (JWT verification)                 │
│  ├─ Row Level Security (RLS)                       │
│  │  ├─ Policies por tabela                         │
│  │  └─ Acesso baseado em papel                     │
│  └─ Database Encryption                            │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Estrutura de Dados - Relacionamentos

```
users (admin, pastor, secretaria, member)
 │
 ├─► documents (uploaded_by)
 ├─► communications (created_by)
 ├─► daily_messages (pastor_id)
 ├─► sermons (pastor_id)
 ├─► events (organizer_id)
 ├─► reports (created_by, reviewed_by)
 └─► pastoral_visits (pastor_id)

members
 │
 ├─► finances (member_id)
 ├─► pastoral_visits (member_id)
 ├─► event_attendance (member_id)
 └─► cell_groups (leader_id)

events
 │
 └─► event_attendance (event_id)

cell_groups
 └─► members (cell_group_id)
```

---

## 🧩 Services & Injeção de Dependência

```typescript
// Componente Angular
@Component({...})
export class MembersComponent {
  // Injetar services
  private memberDb = inject(MembersDatabaseService);
  private auth = inject(SupabaseAuthService);
  private userMgmt = inject(UserManagementService);

  // Usar observables
  members$ = this.memberDb.members$;
  isLoading$ = this.memberDb.isLoading$;
  currentUser$ = this.auth.currentUser$;

  // Methods
  ngOnInit() {
    this.memberDb.getAllMembers().subscribe();
  }
}
```

---

## 📈 Fluxo de Autenticação

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
   [Login]
   (email, password)
       │
       ▼
┌──────────────────────────────┐
│ SupabaseAuthService.signIn() │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Supabase Auth Module    │
│  (Verify credentials)    │
└──────┬───────────────────┘
       │
       ├─ ✅ Valid
       │   ▼
       │  JWT Token
       │  User Data
       │   │
       │   ▼
       │  [Save Session]
       │   │
       │   ▼
       │  Update Observables
       │   │
       │   ▼
       │  [Redirect Dashboard]
       │
       └─ ❌ Invalid
           ▼
           [Show Error]
           [Stay on Login]
```

---

## 🔑 Papéis e Permissões

```
┌─────────────────────────────────────────────────────┐
│                      ADMIN                          │
├─────────────────────────────────────────────────────┤
│ ✓ Criar usuários                                    │
│ ✓ Editar usuários                                   │
│ ✓ Deletar usuários                                  │
│ ✓ Ver todos os dados                                │
│ ✓ Gerar relatórios                                  │
│ ✓ Configurar sistema                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                     PASTOR                          │
├─────────────────────────────────────────────────────┤
│ ✓ Ver membros                                       │
│ ✓ Fazer visitação pastoral                          │
│ ✓ Publicar mensagens diárias                        │
│ ✓ Registrar sermões                                 │
│ ✓ Ver eventos                                       │
│ ✗ CRUD usuários                                     │
│ ✗ Deletar dados                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  SECRETÁRIA                         │
├─────────────────────────────────────────────────────┤
│ ✓ CRUD membros                                      │
│ ✓ CRUD documentos                                   │
│ ✓ Ver finanças                                      │
│ ✓ Gerar relatórios                                  │
│ ✓ Gerenciar eventos                                 │
│ ✗ Deletar usuários                                  │
│ ✗ Editar outros usuários                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                     MEMBER                          │
├─────────────────────────────────────────────────────┤
│ ✓ Ver seu perfil                                    │
│ ✓ Ver eventos                                       │
│ ✓ Ler mensagens                                     │
│ ✗ CRUD qualquer coisa                               │
│ ✗ Ver membros                                       │
└─────────────────────────────────────────────────────┘
```

---

## 💾 Estrutura de Pastas (Novo)

```
sistema-igreja/src/app/
│
├── core/services/
│   ├── supabase-init.service.ts              ✅
│   ├── supabase-auth.service.ts              ✨ NOVO
│   ├── user-management.service.ts            ✨ NOVO
│   ├── members-database.service.ts           ✨ NOVO
│   ├── supabase-media.service.ts             ✅
│   ├── media-hybrid-storage.service.ts       ✅
│   ├── media-pagination.service.ts           ✅
│   ├── media-storage.service.ts              ✅
│   └── ...outros services
│
├── auth/                                      (A CRIAR)
│   ├── login.component.ts
│   ├── register.component.ts
│   ├── reset-password.component.ts
│   └── auth.guard.ts
│
├── admin/                                     (A CRIAR)
│   ├── users/
│   │   ├── users-list.component.ts
│   │   ├── user-detail.component.ts
│   │   └── user-create.component.ts
│   └── reports/
│
├── members/                                   (A EXPANDIR)
│   ├── members-list.component.ts
│   ├── member-detail.component.ts
│   └── member-create.component.ts
│
└── modules/
    ├── dashboard/
    ├── finance/
    ├── events/
    ├── pastor/
    ├── secretaria/
    └── media/
```

---

## 📋 Checklist de Implementação

```
PASSO 1: Database Setup
☐ Execute DATABASE_SCHEMA.sql
☐ Criar usuários de teste
☐ Verificar 14 tabelas criadas
☐ Teste de conexão

PASSO 2: Services Criação
☐ supabase-auth.service.ts ✅ (JÁ CRIADO)
☐ user-management.service.ts ✅ (JÁ CRIADO)
☐ members-database.service.ts ✅ (JÁ CRIADO)

PASSO 3: Componentes Auth
☐ LoginComponent
☐ RegisterComponent
☐ ResetPasswordComponent
☐ AuthGuard

PASSO 4: Componentes Admin
☐ UsersListComponent
☐ UserDetailComponent
☐ UserCreateComponent

PASSO 5: Componentes Members
☐ MembersListComponent
☐ MemberDetailComponent
☐ MemberCreateComponent

PASSO 6: Integração
☐ Rotas com guards
☐ Error handling
☐ Loading states
☐ Success messages

PASSO 7: Testes
☐ Testes unitários
☐ Testes E2E
☐ Cobertura 80%+

PASSO 8: Deploy
☐ Build production
☐ Environment variables
☐ CI/CD pipeline
☐ Deploy em servidor
```

---

## 🎯 KPIs de Sucesso

| Métrica       | Meta    | Status |
| ------------- | ------- | ------ |
| Build errors  | 0       | ✅     |
| Bundle size   | < 1MB   | ✅     |
| Load time     | < 3s    | 🔄     |
| Test coverage | > 80%   | ⏳     |
| Uptime        | > 99%   | 🔄     |
| API response  | < 200ms | 🔄     |

---

## 📞 Documentação Correspondente

| Diagrama          | Ver Documento                       |
| ----------------- | ----------------------------------- |
| Arquitetura geral | DATABASE_IMPLEMENTATION_COMPLETE.md |
| Fluxos detalhados | INTEGRATION_GUIDE.md                |
| Services          | USER_MANAGEMENT_GUIDE.md            |
| SQL schema        | DATABASE_SCHEMA.sql                 |
| Setup             | SUPABASE_DATABASE_SETUP.md          |

---

## 🚀 Próximo Passo Visual

```
              VOCÊ ESTÁ AQUI
                   │
                   ▼
    ┌──────────────────────────┐
    │  Banco de dados criado   │
    │  Services desenvolvidos  │
    │  Docs completa           │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  1. Execute SQL schema   │
    │  2. Criar usuários teste │
    │  3. Testar conexão       │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  4. Criar LoginComponent │
    │  5. Criar UsersComponent │
    │  6. Criar Guards         │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  7. Integrar rotas       │
    │  8. Testar fluxo         │
    │  9. Deploy               │
    └──────────────────────────┘
```

---

**Visual map created**: 2024
**Status**: ✅ Complete
