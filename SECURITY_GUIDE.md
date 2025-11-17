# 🔐 Guia de Segurança - Credenciais e Chaves

## ⚠️ Regra de Ouro

**NUNCA COMMITAR CREDENCIAIS NO GIT!**

```bash
❌ ERRADO:
git commit -m "Add Supabase keys"
git add src/environments/environment.ts

✅ CORRETO:
cp environment.example.ts environment.ts
# Edite environment.ts localmente
# environment.ts está no .gitignore
```

## 🔒 Estrutura de Proteção

### 1. `.gitignore` Bloqueando Credenciais

```gitignore
# Essas linhas estão no .gitignore:
src/environments/environment.ts
src/environments/environment.prod.ts
.env
.env.local
```

### 2. Arquivos de Exemplo (Commitáveis)

```typescript
// ✅ COMMITAR: environment.example.ts
export const environment = {
  production: false,
  supabase: {
    url: "https://sua-project.supabase.co",
    anonKey: "sua-chave-anonima-aqui",
  },
};
```

### 3. Arquivos Reais (NÃO Commitar)

```typescript
// ❌ NÃO COMMITAR: environment.ts
export const environment = {
  production: false,
  supabase: {
    url: "https://abc123.supabase.co", // Chave REAL
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5...", // Chave REAL
  },
};
```

## 📋 Checklist de Segurança

### Antes de fazer commit:

- [ ] `environment.ts` está no `.gitignore`?
- [ ] `.env` está no `.gitignore`?
- [ ] Nenhum arquivo com chaves vai ser adicionado?

```bash
# Verificar o que será commitado:
git status
git diff --cached

# Se viu arquivo com credenciais:
git reset HEAD ambiente-com-credencial.ts
```

### Recuperar se acidentalmente commitou:

```bash
# 1. Remover o arquivo do histórico
git filter-branch --tree-filter 'rm -f src/environments/environment.ts' HEAD

# 2. Forçar push (CUIDADO - altera histórico)
git push origin --force

# 3. Rotacionar chaves no Supabase imediatamente!
```

## 🚀 Workflow de Desenvolvimento

### Novo desenvolvedor clonando:

```bash
1. git clone <repo>
cd sistema-igreja

2. cp src/environments/environment.example.ts src/environments/environment.ts

3. # Editar environment.ts com suas credenciais
nano src/environments/environment.ts

4. npm install
npm start
```

### Deploy em Produção:

```bash
# Variáveis de ambiente no servidor:
export SUPABASE_URL="https://abc123.supabase.co"
export SUPABASE_KEY="chave-produção-aqui"

# Arquivo de build deve usar essas variáveis:
# (configurado em environment.prod.ts)
```

## 🔄 Ciclo de Vida das Chaves

### 1. Desenvolvimento Local

- Arquivo: `src/environments/environment.ts`
- Chave: Development/Test
- Armazenamento: Local (não commitado)
- Rotação: Mensal

### 2. Staging

- Arquivo: CI/CD ou .env no servidor
- Chave: Staging
- Armazenamento: Secrets Manager
- Rotação: Trimestral

### 3. Produção

- Arquivo: CI/CD ou .env no servidor
- Chave: Production (Supabase premium)
- Armazenamento: Secrets Manager (AWS/Azure)
- Rotação: Anual + após incidentes

## 🛠️ Ferramentas de Proteção

### Git Hooks (Prevenir commits acidentais)

Criar `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Rejeitar commit se contiver credenciais

FILES=$(git diff --cached --name-only)

for file in $FILES; do
  if [[ $file =~ environment\.ts$ ]]; then
    if [[ $file != *"example"* ]]; then
      echo "❌ ERRO: Tentativa de commitar $file com credenciais!"
      echo "Use: git reset HEAD $file"
      exit 1
    fi
  fi
done
```

### Verificação com Git Secrets

```bash
# Instalar
brew install git-secrets

# Configurar
git secrets --install
git secrets --register-aws

# Verificar
git secrets --scan
```

## 🆘 Se as Chaves Foram Expostas

### Ação Imediata:

1. **Desabilitar chaves no Supabase**

   - Dashboard → Settings → API
   - Gerar novas chaves

2. **Notificar equipe**

   - Mensagem urgente no Slack/Teams

3. **Auditar logs**

   - Supabase Dashboard → Logs
   - Verificar acessos suspeitos

4. **Atualizar aplicação**
   - Implementar novas chaves
   - Deploy em produção

## 📚 Referências

- [OWASP - Secret Management](https://owasp.org/www-project-web-security-testing-guide/)
- [Supabase - API Keys Security](https://supabase.com/docs/guides/auth)
- [Git - Handling Sensitive Data](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)

## ✅ Boas Práticas

| Prática              | ✅ Fazer                | ❌ Evitar               |
| -------------------- | ----------------------- | ----------------------- |
| **Versionamento**    | Commitar `*.example.ts` | Commitar arquivos reais |
| **Armazenamento**    | Local/.gitignore        | Arquivo versionado      |
| **Compartilhamento** | 1Password/LastPass      | Email/Slack             |
| **Rotação**          | Mensal                  | Nunca                   |
| **Monitoramento**    | Logs ativados           | Sem auditoria           |
| **Backup**           | Seguro/Criptografado    | Inseguro                |

---

**Lembre-se: Segurança é responsabilidade de todos! 🔐**
