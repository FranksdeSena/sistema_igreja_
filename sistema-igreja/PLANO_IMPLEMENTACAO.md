# 📋 Plano de Implementação - Sistema Igreja

## 🎯 Visão Geral

Implementação dos 4 módulos restantes + testes + Supabase + Deploy

---

## 📅 Fase 1: Implementação dos Módulos (Semana 1-2)

### 1.1 Módulo Finance (Financeiro)

**Objetivo**: Gestão de dízimos, ofertas e transações

#### Entidade: Transaction

```typescript
interface Transaction {
  id: string;
  churchId: string;
  type: 'tithe' | 'offering' | 'expense' | 'donation';
  amount: number;
  description: string;
  date: Date;
  memberId?: string;
  category: string;
  paymentMethod: 'cash' | 'check' | 'pix' | 'transfer' | 'other';
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Funcionalidades

- ✅ Listagem com filtros por tipo/data
- ✅ Criar transação
- ✅ Editar transação
- ✅ Deletar transação
- ✅ Relatório mensal (gráfico + totais)
- ✅ Export CSV

#### UI Components

```
1. finance.component.ts
   - Dashboard com stats (Total, Receita, Despesa)
   - Gráfico de transações por tipo
   - Tabela com filtros

2. finance-form.component.ts
   - Formulário com campos específicos
   - Validações

3. finance-report.component.ts (Novo)
   - Relatório mensal/anual
   - Gráficos
   - Download CSV
```

**Tempo estimado**: 6-8 horas

---

### 1.2 Módulo Events (Eventos)

**Objetivo**: Gestão de eventos da igreja e inscrições

#### Entidade: Event

```typescript
interface Event {
  id: string;
  churchId: string;
  name: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: 'sermon' | 'meeting' | 'retreat' | 'activity' | 'other';
  capacity?: number;
  status: 'planned' | 'ongoing' | 'finished' | 'cancelled';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended';
  registeredAt: Date;
  confirmedAt?: Date;
}
```

#### Funcionalidades

- ✅ Calendário visual dos eventos
- ✅ Criar evento
- ✅ Editar evento
- ✅ Deletar evento
- ✅ Inscrição de membros
- ✅ Confirmação de presença
- ✅ Lista de presença
- ✅ Notificações (futura integração WhatsApp)

#### UI Components

```
1. events.component.ts
   - Calendário visual (ng-calendar)
   - Lista de próximos eventos

2. event-form.component.ts
   - Formulário com data/hora

3. event-detail.component.ts (Novo)
   - Detalhes do evento
   - Inscritos
   - Lista de presença

4. event-registration.component.ts (Novo)
   - Modal/formulário de inscrição
```

**Tempo estimado**: 8-10 horas

---

### 1.3 Módulo Pastor (Pastoral)

**Objetivo**: Gestão de atividades pastorais e serviços

#### Entidade: Sermon

```typescript
interface Sermon {
  id: string;
  churchId: string;
  title: string;
  pastor: string;
  date: Date;
  duration: number; // minutos
  theme?: string;
  keyVerses?: string[];
  outline?: string;
  recordings?: {
    audio?: string;
    video?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PastoralVisit {
  id: string;
  churchId: string;
  memberId: string;
  date: Date;
  type: 'regular' | 'hospital' | 'counseling' | 'prayer' | 'other';
  notes: string;
  nextVisit?: Date;
  createdAt: Date;
}
```

#### Funcionalidades

- ✅ Gestão de sermões (criar, editar, deletar)
- ✅ Esboços de pregações
- ✅ Histórico de visitações
- ✅ Agendamento de cuidados pastorais
- ✅ Notas de aconselhamento
- ✅ Calendário pastoral
- ✅ Relatórios de atividades

#### UI Components

```
1. pastor.component.ts
   - Dashboard com últimos sermões
   - Próximas visitações

2. sermon-form.component.ts
   - Criar/editar sermão

3. pastoral-visit.component.ts (Novo)
   - Gestão de visitações

4. pastoral-calendar.component.ts (Novo)
   - Calendário de atividades
```

**Tempo estimado**: 6-8 horas

---

### 1.4 Módulo Secretaria (Administrativo)

**Objetivo**: Gestão administrativa e documentos

#### Entidade: Document

```typescript
interface Document {
  id: string;
  churchId: string;
  title: string;
  type: 'letter' | 'report' | 'certificate' | 'form' | 'other';
  category: string;
  content?: string;
  fileUrl?: string;
  date: Date;
  createdBy: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Bulletin {
  id: string;
  churchId: string;
  title: string;
  content: string;
  date: Date;
  recipients: string[]; // IDs ou grupos
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}
```

#### Funcionalidades

- ✅ Gestão de documentos
- ✅ Comunicados/Boletins
- ✅ Relatórios
- ✅ Backup de dados
- ✅ Auditoria de ações
- ✅ Templates de documentos
- ✅ Gestão de estatísticas

#### UI Components

```
1. secretaria.component.ts
   - Dashboard com stats
   - Últimos documentos

2. document-form.component.ts
   - Criar/editar documento

3. bulletin.component.ts (Novo)
   - Gestão de comunicados

4. reports.component.ts (Novo)
   - Relatórios gerenciais
```

**Tempo estimado**: 5-7 horas

---

## 📅 Fase 2: Testes Unitários & E2E (Semana 2-3)

### 2.1 Testes Unitários (Jasmine + Karma)

#### Por Módulo

```
finance/
  ├── finance.service.spec.ts
  ├── finance.component.spec.ts
  └── finance-form.component.spec.ts

events/
  ├── events.service.spec.ts
  ├── events.component.spec.ts
  └── event-form.component.spec.ts

pastor/
  ├── pastor.service.spec.ts
  ├── pastor.component.spec.ts
  └── sermon-form.component.spec.ts

secretaria/
  ├── secretaria.service.spec.ts
  ├── secretaria.component.spec.ts
  └── document-form.component.spec.ts
```

#### Cobertura Mínima: 80%

**Tempo estimado**: 8 horas

---

### 2.2 Testes E2E (Cypress)

#### Cenários

```
1. Autenticação
   - Login com credenciais válidas
   - Login com credenciais inválidas
   - Logout

2. Navegação
   - Navegação entre módulos
   - Indicador ativo correto
   - Botão voltar funciona

3. CRUD Completo (para cada módulo)
   - Criar item
   - Ler/Listar items
   - Editar item
   - Deletar item

4. Busca e Filtros
   - Busca por texto
   - Filtros por status
   - Resultados vazios

5. Responsividade
   - Layout mobile
   - Layout tablet
   - Layout desktop
```

**Tempo estimado**: 10 horas

---

## 📅 Fase 3: Integração Supabase (Semana 3-4)

### 3.1 Setup Supabase

```bash
npm install @supabase/supabase-js
```

#### Environment

```typescript
// environment.ts
export const environment = {
  supabaseUrl: 'https://[PROJECT].supabase.co',
  supabaseKey: '[ANON_KEY]',
  apiUrl: 'http://localhost:4200',
};
```

---

### 3.2 Estrutura do Banco de Dados

#### Tabelas

```sql
-- Users (através do Supabase Auth)
id, email, role, name, ...

-- Churches
id, name, address, phone, ...

-- Members
id, churchId, name, email, phone, ...

-- Transactions
id, churchId, type, amount, date, ...

-- Events
id, churchId, name, date, ...

-- EventRegistrations
id, eventId, memberId, status, ...

-- Sermons
id, churchId, title, date, ...

-- PastoralVisits
id, churchId, memberId, date, ...

-- Documents
id, churchId, title, type, ...

-- Bulletins
id, churchId, title, status, ...
```

---

### 3.3 Row Level Security (RLS)

```sql
-- Membros só veem sua própria church
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members from their church"
ON members FOR SELECT
USING (churchId = current_setting('app.church_id')::text);
```

---

### 3.4 Migração de Services

Converter services de mock para real:

```typescript
// Exemplo: MembersService

@Injectable({ providedIn: 'root' })
export class MembersService {
  private supabase = inject(SupabaseService);

  constructor(private http: HttpClient) {}

  getMembers(): Observable<Member[]> {
    return this.supabase
      .from('members')
      .select('*')
      .pipe(map((response) => response.data as Member[]));
  }

  addMember(member: Omit<Member, 'id'>): Observable<Member> {
    return this.supabase
      .from('members')
      .insert([member])
      .pipe(map((response) => response.data?.[0] as Member));
  }

  // ... updateMember, deleteMember, searchMembers
}
```

**Tempo estimado**: 12-15 horas

---

## 📅 Fase 4: Deploy em Produção (Semana 4)

### 4.1 Build Otimizado

```bash
ng build --configuration production --optimization --build-optimizer
```

#### Otimizações

- ✅ Lazy loading confirmado
- ✅ Tree-shaking
- ✅ Minification
- ✅ AOT compilation
- ✅ Code splitting

---

### 4.2 Environments

```
development:  ng serve
staging:      ng build --configuration staging
production:   ng build --configuration production
```

---

### 4.3 Opções de Deploy

#### A. Vercel (Recomendado para Angular)

```bash
npm install -g vercel
vercel
```

#### B. Netlify

```bash
npm run build
netlify deploy
```

#### C. Firebase

```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

#### D. Docker + AWS/Google Cloud

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 4.4 CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
      - run: npm run test
      - run: npm run cypress:run
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod
```

---

### 4.5 Monitoramento Pós-Deploy

- ✅ Sentry para error tracking
- ✅ Google Analytics
- ✅ Performance monitoring
- ✅ Uptime monitoring

---

## 📊 Timeline Total

| Fase        | Semana        | Horas           | Status |
| ----------- | ------------- | --------------- | ------ |
| 1. Módulos  | 1-2           | 28-32           | ⏳     |
| 2. Testes   | 2-3           | 18              | ⏳     |
| 3. Supabase | 3-4           | 12-15           | ⏳     |
| 4. Deploy   | 4             | 8-10            | ⏳     |
| **Total**   | **4 semanas** | **66-75 horas** | ⏳     |

---

## 🚀 Próximas Ações

1. **Agora**: Confirmação do plan
2. **Hoje**: Iniciar Fase 1.1 (Finance)
3. **Semana 1**: Completar todos os 4 módulos
4. **Semana 2**: Testes
5. **Semana 3**: Supabase
6. **Semana 4**: Deploy

---

**Status**: 🔄 Pronto para começar!
**Versão**: 1.0
**Data**: 15/11/2025
