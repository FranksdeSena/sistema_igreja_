# 🚀 Como Executar o Setup - Windows (PowerShell)

## ✅ Setup Completado!

O script de setup foi executado com sucesso. Você já tem:

- ✅ Node.js instalado
- ✅ Dependências instaladas
- ✅ Arquivos de ambiente criados
- ✅ Segurança configurada

---

## 📝 Próximo Passo: Adicionar Credenciais Supabase

### 1️⃣ Abrir arquivo de configuração

```bash
# No VS Code
# Arquivo → Abrir: sistema-igreja/src/environments/environment.ts
```

### 2️⃣ Adicionar suas credenciais

Edite `sistema-igreja/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: "https://seu-projeto.supabase.co", // ← Cole aqui
    anonKey: "sua-chave-anonima-aqui", // ← Cole aqui
  },
};
```

### 3️⃣ Obter credenciais do Supabase

1. Acesse: https://supabase.com
2. Login → Seu projeto
3. Vá em: **Settings** → **API**
4. Copie:
   - **Project URL** (colar em `url`)
   - **anon public** (colar em `anonKey`)

---

## 🎯 Começar a Desenvolver

### No VS Code Terminal (PowerShell):

```bash
# Inicie o servidor local
npm start

# Abra no navegador:
# http://localhost:4200
```

---

## 📚 Documentação Útil

```bash
# Ler documentação (no terminal do VS Code):
cat QUICK_START.md              # 5 minutos
cat SETUP_LOCAL.md              # Setup completo
cat SUPABASE_SETUP.md           # Cloud config
cat SECURITY_GUIDE.md           # Proteção
```

---

## ✅ Checklist

- [ ] Abri `environment.ts`
- [ ] Adicionei credenciais Supabase
- [ ] Criei conta em supabase.com
- [ ] Copiei URL e anonKey
- [ ] Salvei o arquivo
- [ ] Executei `npm start`
- [ ] Abri http://localhost:4200

---

## 🎉 Pronto!

Você está 100% pronto para começar a desenvolver o Sistema Igreja!

**Próximo:** Explore os módulos em http://localhost:4200
