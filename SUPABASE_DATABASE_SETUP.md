# SUPABASE DATABASE SETUP - GUIA COMPLETO

## 📋 Passo 1: Acessar o Supabase Dashboard

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto (ou crie um novo)
4. Vá para **SQL Editor** na barra lateral esquerda

## 🔧 Passo 2: Executar o Schema SQL

### Opção A: Via SQL Editor (RECOMENDADO)

1. Abra **SQL Editor**
2. Clique em **"New Query"** (botão azul no topo)
3. Copie TODO o conteúdo de `DATABASE_SCHEMA.sql`
4. Cole no editor SQL
5. Clique em **"Run"** (ou Ctrl+Enter)
6. Aguarde a execução (deve levar 5-15 segundos)
7. Verifique se não há erros na seção de resultados

### Opção B: Via psql (CLI)

```bash
# 1. Instale psql (https://www.postgresql.org/download/)
# 2. Conecte ao seu banco Supabase
psql -h seu-projeto.supabase.co -U postgres -d postgres

# 3. Cole todo o conteúdo do DATABASE_SCHEMA.sql e execute
```

## 🎯 Passo 3: Verificar as Tabelas Criadas

No **SQL Editor**, execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver estas tabelas:

- ✅ birthdays
- ✅ cell_groups
- ✅ communications
- ✅ daily_messages
- ✅ documents
- ✅ event_attendance
- ✅ events
- ✅ finances
- ✅ media
- ✅ members
- ✅ pastoral_visits
- ✅ reports
- ✅ sermons
- ✅ users

## 👥 Passo 4: Configurar Autenticação

### 4.1 - Habilitar Supabase Auth

1. Vá para **Authentication** → **Providers**
2. Habilite **Email** (já vem habilitado por padrão)
3. Clique em **"Save"**

### 4.2 - Criar Usuários de Teste

Via **SQL Editor**, execute:

```sql
-- Criar usuário Admin
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  phone_confirmed_at
) VALUES (
  gen_random_uuid(),
  'admin@igreja.com',
  now(),
  '{"name": "Administrador"}',
  '{"role": "admin"}',
  now(),
  now(),
  now()
);

-- Criar usuário Pastor
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'pastor@igreja.com',
  now(),
  '{"name": "Pastor João"}',
  '{"role": "pastor"}',
  now(),
  now()
);

-- Criar usuário Secretária
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'secretaria@igreja.com',
  now(),
  '{"name": "Secretária Maria"}',
  '{"role": "secretaria"}',
  now(),
  now()
);
```

**IMPORTANTE**: Você precisará redefinir as senhas via:

- Dashboard → Authentication → Users
- Clique em cada usuário → "Send password reset" ou "Send magic link"

### 4.3 - Definir Senhas de Teste

1. Acesse **Authentication** → **Users**
2. Para cada usuário, clique em **"..."** → **"Reset password"**
3. Um email será enviado (ou você pode usar Magic Link)

**Credenciais de Teste** (após reset):

```
Admin:
Email: admin@igreja.com
Papel: admin

Pastor:
Email: pastor@igreja.com
Papel: pastor

Secretária:
Email: secretaria@igreja.com
Papel: secretaria
```

## 🔐 Passo 5: Verificar Row Level Security (RLS)

No **SQL Editor**, execute:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Todas as tabelas devem ter `rowsecurity = true`.

## 📦 Passo 6: Integrar no Angular

As seguintes mudanças já foram feitas no projeto:

✅ Supabase inicializado em `main.ts`
✅ Credenciais em `environment.ts`
✅ Services criados (supabase-init, supabase-media, etc)

### Verificar Inicialização

1. Abra `main.ts`
2. Procure por `initializeApp()`
3. Deve estar chamando Supabase init

### Testar Conexão

No console do navegador (F12), execute:

```javascript
// Testar conexão Supabase
const { data, error } = await supabase.from("members").select().limit(1);
console.log("Conexão Supabase:", { data, error });
```

## 🧪 Passo 7: Testes Manuais

### Teste 1: Criar Membro

```sql
INSERT INTO public.members (
  full_name,
  email,
  phone,
  status,
  member_type
) VALUES (
  'João Silva',
  'joao@exemplo.com',
  '11999999999',
  'active',
  'regular'
) RETURNING *;
```

### Teste 2: Registrar Contribuição

```sql
INSERT INTO public.finances (
  type,
  amount,
  description,
  recorded_by,
  payment_method
) VALUES (
  'tithe',
  150.00,
  'Dízimo',
  (SELECT id FROM auth.users LIMIT 1),
  'pix'
) RETURNING *;
```

### Teste 3: Criar Evento

```sql
INSERT INTO public.events (
  title,
  description,
  event_type,
  start_date,
  end_date,
  location,
  organizer_id
) VALUES (
  'Culto de Domingo',
  'Culto Principal',
  'service',
  now() + interval '3 days',
  now() + interval '3 days 2 hours',
  'Templo Principal',
  (SELECT id FROM auth.users WHERE email = 'pastor@igreja.com' LIMIT 1)
) RETURNING *;
```

## 🛑 Troubleshooting

### Erro: "Relation does not exist"

- Verifique se todas as tabelas foram criadas
- Rode `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`

### Erro: "Foreign key violation"

- Uma tabela está referenciando outra que não existe
- Verifique se all os INSERTs têm IDs válidos

### Erro: "RLS policy violation"

- Você não tem permissão para essa operação
- Verifique se seu usuário tem o papel correto

### RLS Bloqueando Leitura

Se as queries estão retornando vazio mesmo com dados:

```sql
-- Temporariamente desabilitar RLS para debug (NÃO em produção!)
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Depois re-habilitar
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
```

## 📊 Monitoramento

### Ver Storage Usage

Dashboard → Settings → Billing → Storage

### Ver Logs de Erro

Dashboard → Logs → Error

### Ver Queries Lentas

Dashboard → Logs → Postgres

## 🚀 Próximos Passos

1. ✅ Schema criado
2. ✅ Auth configurado
3. ✅ RLS ativo
4. 🔄 Atualizar Services Angular
5. 🔄 Implementar Login
6. 🔄 Testar CRUD operations

## 📞 Suporte

Documentação Supabase: https://supabase.com/docs
Community: https://discord.supabase.io

---

**Criado em**: 2024
**Versão**: 1.0
**Status**: ✅ Pronto para uso
