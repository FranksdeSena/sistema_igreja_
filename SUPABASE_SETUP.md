# 🚀 Setup Supabase para Sistema Igreja

## 1️⃣ Criar Projeto Supabase

### Passo 1: Cadastro

- Acesse [supabase.com](https://supabase.com)
- Clique em "Start your project"
- Autentique com GitHub/Google/Email
- Clique em "New project"

### Passo 2: Configuração do Projeto

```
Project Name: sistema-igreja
Database Password: [Crie uma senha forte]
Region: [Escolha mais próximo - ex: South America / São Paulo]
Pricing Plan: Free (100GB)
```

## 2️⃣ Copiar Credenciais

### No Dashboard Supabase:

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: https://xyzabc.supabase.co)
   - **anon public** (ex: eyJ0eXAi...)

### No arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: "https://xyzabc.supabase.co", // Cole aqui
    anonKey: "eyJ0eXAi...", // Cole aqui
  },
};
```

## 3️⃣ Criar Tabelas no Supabase

### SQL a executar em **SQL Editor**:

```sql
-- Criar tabela de mídia
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'document')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration INTEGER,
  category TEXT DEFAULT 'general',
  uploaded_by TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_media_church_id ON media(church_id);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_views(media_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE media SET views = views + 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar likes
CREATE OR REPLACE FUNCTION increment_likes(media_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE media SET likes = likes + 1, updated_at = CURRENT_TIMESTAMP
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;
```

## 4️⃣ Criar Storage Bucket

### No Dashboard Supabase:

1. Vá em **Storage**
2. Clique em **Create a new bucket**
3. Nome: `media-items`
4. Privado: **desativado** (para acessos públicos)
5. Clique em **Create bucket**

## 5️⃣ Configurar Segurança (RLS Policies)

### No Storage → media-items → Policies:

```sql
-- SELECT: Todos podem ler
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-items');

-- INSERT: Autenticados podem enviar
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-items' AND auth.role() = 'authenticated');
```

## 6️⃣ Testando Localmente

### Executar aplicação:

```bash
cd src/app/modules/dashboard
npm install
npm start
```

### No console do navegador (F12):

```javascript
// Verificar inicialização do Supabase
console.log("Verificando Supabase...");

// Deve aparecer: "✅ Supabase inicializado com sucesso"
```

## 7️⃣ Fluxo de Sincronização

```
Upload Foto
    ↓
1. Salva em IndexedDB (instantâneo)
    ↓
2. Envia para Supabase Storage (background)
    ↓
3. Salva metadados em Supabase DB
    ↓
4. Atualiza status: "syncing" → "published"
    ↓
✅ Disponível online e offline
```

## 8️⃣ Checklist de Produção

- [ ] Criar projeto Supabase
- [ ] Copiar credenciais para `environment.ts`
- [ ] Executar SQL para criar tabelas
- [ ] Criar bucket `media-items`
- [ ] Testar upload de foto
- [ ] Testar sincronização
- [ ] Verificar dados no Dashboard Supabase
- [ ] Testar modo offline
- [ ] Deploy em produção

## 🔗 Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

## 💡 Dicas

### Aumentar limite de upload:

```
Settings → Storage → Max file size → Aumentar para 50MB
```

### Monitorar uso:

```
Billing → Monitoring → Storage usage
```

### Backup automático:

```
Habilitado por padrão em Supabase Free
```

---

**Desenvolvido com ❤️ para Sistema Igreja**
