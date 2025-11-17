# ▶️ COMO EXECUTAR O SQL SCHEMA

## 🎯 Objetivo

Criar 14 tabelas no Supabase com relacionamentos, índices e segurança.

## ⏱️ Tempo Estimado: 5 minutos

---

## 📋 PASSO 1: Acessar Supabase

1. Abra [https://app.supabase.com](https://app.supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto

![Supabase Dashboard](https://via.placeholder.com/600x400)

---

## 🖱️ PASSO 2: Ir para SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Você verá uma lista de queries existentes
3. Clique em **"New Query"** (botão azul no topo direito)

![SQL Editor](https://via.placeholder.com/600x400)

---

## 📝 PASSO 3: Copiar SQL Schema

### Opção A: Via Arquivo (RECOMENDADO)

1. Abra `DATABASE_SCHEMA.sql` neste repositório
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

### Opção B: Copiar Diretamente

Aqui está o início do schema. Copie o arquivo completo:

```sql
-- ========================================
-- SISTEMA IGREJA - DATABASE SCHEMA
-- Supabase SQL Setup Completo
-- ========================================

-- 1. TABELA DE USUÁRIOS (AUTENTICAÇÃO)
-- Estende a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'secretaria', 'member')),
  ...
```

---

## 📄 PASSO 4: Colar no SQL Editor

1. Clique na área de texto do SQL Editor
2. Cole TODO o conteúdo (Ctrl+V)
3. Você verá o SQL com syntax highlighting

```
[Área do SQL Editor com o código colado]
```

---

## ▶️ PASSO 5: Executar o Script

### Método 1: Atalho do Teclado (MAIS RÁPIDO)

- Pressione **Ctrl+Enter**

### Método 2: Botão

- Clique em **"Run"** (botão verde no topo)

### Método 3: Menu

- Clique em **"▶"** (play icon)

---

## ⏳ PASSO 6: Aguardar Execução

Você verá:

```
⏳ Executando...
[Progresso]
```

**Tempo esperado**: 5-15 segundos

---

## ✅ PASSO 7: Verificar Sucesso

Você deve ver:

```
✅ Query executed successfully
```

Se houver erro, aparecerá em vermelho:

```
❌ [ERROR] TS18047: ...
```

### Verificar Tabelas Criadas

Execute esta query para confirmar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:**

```
table_name
─────────────────────
birthdays
cell_groups
communications
daily_messages
documents
event_attendance
events
finances
media
members
pastoral_visits
reports
sermons
users
```

Total: **14 tabelas** ✅

---

## 🔍 PASSO 8: Verificar Índices

```sql
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
```

Deve ter **12 índices** ✅

---

## 🔐 PASSO 9: Verificar RLS Policies

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Deve ter `rowsecurity = true` em várias tabelas ✅

---

## 🚨 Troubleshooting

### ❌ Erro: "Relation does not exist"

**Causa**: A tabela foi criada mas há referência circular
**Solução**: Execute a query novamente, às vezes a ordem importa

### ❌ Erro: "Syntax error"

**Causa**: Código SQL inválido
**Solução**:

1. Verifique se copiou todo o arquivo
2. Procure por linhas vermelhas
3. Tente copiar novamente

### ❌ Erro: "Permission denied"

**Causa**: Você não tem permissão
**Solução**: Deve ser proprietário ou admin do projeto

### ❌ Timeout

**Causa**: Query levou muito tempo
**Solução**: Tente novamente, às vezes Supabase fica lento

### ❌ Nada aconteceu

**Causa**: O script não foi executado
**Solução**: Clique em "Run" ou pressione Ctrl+Enter

---

## 💡 Dicas

1. **Copie o arquivo completo** - Não copie partes
2. **Verifique a sintaxe** - SQL é case-sensitive
3. **Execute de uma vez** - Não execute cada CREATE TABLE separadamente
4. **Aguarde completar** - Não cancele no meio
5. **Verifique no final** - Use queries de verificação

---

## ✅ Confirmação Final

Se tudo funcionou, você verá:

```
✅ 14 tabelas criadas
✅ 12 índices criados
✅ 8 políticas RLS ativas
✅ 7 triggers definidos
✅ 3 funções criadas
```

---

## 🎯 Próximo Passo

Depois de executar com sucesso:

1. **Criar usuários de teste** (veja SUPABASE_DATABASE_SETUP.md)
2. **Testar conexão no console** (F12)
3. **Integrar no Angular** (veja INTEGRATION_GUIDE.md)

---

## 📝 Exemplo Completo

### Antes de Executar

```
[SQL Editor vazio]
```

### Colando o Schema

```
[Textarea com 600+ linhas de SQL]
```

### Depois de Executar

```
✅ Query executed successfully
Rows affected: 0
Execution time: 8.234 seconds
```

### Verificação

```sql
SELECT COUNT(*) as total FROM information_schema.tables
WHERE table_schema = 'public';

Result:
───────
14
```

---

## 🔗 Links Úteis

- Supabase SQL Editor: https://app.supabase.com
- SQL Reference: https://www.postgresql.org/docs/
- Supabase Docs: https://supabase.com/docs

---

## 📞 Suporte

**Se algo não funcionar:**

1. Verifique o erro exato
2. Procure no DATABASE_SCHEMA.sql por problemas de sintaxe
3. Tente executar novamente
4. Se persistir, consulte TROUBLESHOOTING em SUPABASE_DATABASE_SETUP.md

---

## ✨ Sucesso!

Se você chegou aqui significa que:

- ✅ SQL schema foi executado
- ✅ 14 tabelas foram criadas
- ✅ Banco de dados está pronto
- 🎉 **Próximo passo: Criar usuários!**

---

**Tempo total:** ~5 minutos
**Dificuldade:** ⭐ Fácil
**Status**: ✅ Pronto!
