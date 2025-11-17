# ⚡ Quick Start - Sistema Igreja

## 🚀 Início Rápido (5 minutos)

### Windows

```bash
setup.bat
# Edite: src/environments/environment.ts
npm start
```

### Linux / Mac

```bash
chmod +x setup.sh
./setup.sh
# Edite: src/environments/environment.ts
npm start
```

## 📝 Configuração Supabase (2 minutos)

1. Crie conta: [supabase.com](https://supabase.com)
2. Dashboard → Settings → API
3. Copie URL e anonKey
4. Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: "cole-aqui-a-url",
    anonKey: "cole-aqui-a-chave",
  },
};
```

5. Salve e pronto!

## 🗄️ SQL Setup Supabase

Copie/cole no SQL Editor do Supabase Dashboard:

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_church_id ON media(church_id);
CREATE INDEX idx_media_status ON media(status);
```

## 📁 Storage Setup

No Dashboard → Storage:

- Crie bucket: `media-items`
- Deixe **público** (upsert desativado)

## ✅ Pronto!

```bash
npm start
# Acesse: http://localhost:4200
```

## 🔐 Segurança

```bash
# ❌ NUNCA faça:
git add src/environments/environment.ts
git push com credenciais

# ✅ SEMPRE faça:
# Editar arquivo localmente (já está no .gitignore)
# Verificar status: git status
# Fazer push (seguro)
```

## 📚 Documentação

- `SETUP_LOCAL.md` - Setup completo
- `SUPABASE_SETUP.md` - Detalhes Supabase
- `SECURITY_GUIDE.md` - Proteção credenciais
- `IMPLEMENTATION_SUMMARY.md` - O que foi feito

## 🆘 Problemas?

### "Supabase não inicializado"

```
✓ Verifique environment.ts
✓ Confirme URL e chave
✓ Salve e recarregue
```

### "Erro ao fazer upload"

```
✓ Bucket 'media-items' existe?
✓ Arquivo < 50MB?
✓ Tipo suportado? (foto, vídeo, doc)
```

### "Build falhando"

```bash
rm -rf node_modules
npm install
npm run build
```

## 💻 Comandos Úteis

```bash
# Desenvolvimento
npm start           # Inicia servidor local
npm run build      # Build produção
npm run lint       # Verificar código

# Segurança
git status         # Ver o que será commitado
git diff --cached  # Ver mudanças

# Supabase
# No dashboard: https://sua-project.supabase.co/
```

## 🎯 Módulos Disponíveis

- **Dashboard** - `/dashboard`
- **Membros** - `/members`
- **Finanças** - `/finance`
- **Eventos** - `/events`
- **Pastor** - `/pastor`
- **Galeria Mídia** - `/pastor/galeria`
- **Secretaria** - `/secretaria`

## 🔗 Links

- [Angular Docs](https://angular.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Pronto! Comece a desenvolver! 🚀**
