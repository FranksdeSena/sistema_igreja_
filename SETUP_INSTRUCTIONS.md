# 🚀 Como Executar Setup - Sistema Igreja

## Windows (PowerShell)

### Opção 1: PowerShell Script (Recomendado)

```powershell
# Executar no PowerShell:
.\setup.ps1
```

### Opção 2: Batch Script

```cmd
# Executar no CMD:
setup.bat
```

### Opção 3: Node.js (Universal)

```powershell
# Executar em qualquer terminal:
node setup.js
```

---

## Linux / Mac

### Opção 1: Bash Script

```bash
chmod +x setup.sh
./setup.sh
```

### Opção 2: Node.js (Universal)

```bash
node setup.js
```

---

## ⚠️ Importante: PowerShell Policy

Se receber erro de policy no PowerShell:

```powershell
# Solução 1: Executar com caminho completo
.\setup.ps1

# Solução 2: Usar node (mais universal)
node setup.js

# Solução 3: (Não recomendado) Mudar policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

---

## Manual (Sem Script)

```bash
# 1. Instalar dependências
npm install

# 2. Copiar arquivo de configuração
cp src/environments/environment.example.ts src/environments/environment.ts

# 3. Editar arquivo
nano src/environments/environment.ts
# Adicione suas credenciais Supabase

# 4. Iniciar
npm start
```

---

## ✅ Após Setup

1. **Edite:** `src/environments/environment.ts`
2. **Adicione:** Suas credenciais Supabase
3. **Inicie:** `npm start`
4. **Acesse:** http://localhost:4200

---

## 📚 Documentação

- `QUICK_START.md` - Início rápido
- `SETUP_LOCAL.md` - Setup completo
- `SUPABASE_SETUP.md` - Configurar cloud
- `SECURITY_GUIDE.md` - Proteção de credenciais

---

**Recomendação:** Use `node setup.js` - funciona em todos os SOs! 🎯
