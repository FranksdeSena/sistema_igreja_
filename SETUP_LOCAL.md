# 🏗️ Setup Local do Projeto

## 1️⃣ Clonar Repositório

```bash
git clone <repo-url>
cd sistema-igreja
```

## 2️⃣ Instalar Dependências

```bash
npm install
```

## 3️⃣ Configurar Variáveis de Ambiente

### Criar arquivos de configuração local:

```bash
# Copiar exemplos
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
```

### Abrir `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: "https://seu-projeto.supabase.co", // ← Adicione sua URL
    anonKey: "sua-chave-anonima-aqui", // ← Adicione sua chave
  },
};
```

### Obter credenciais:

1. Acesse [supabase.com](https://supabase.com)
2. Login → Projeto
3. Vá em **Settings** → **API**
4. Copie **Project URL** e **anon public**

## 4️⃣ Executar Aplicação

```bash
npm start
# ou
ng serve
```

Abra [http://localhost:4200](http://localhost:4200)

## 5️⃣ Build para Produção

```bash
npm run build
# ou
ng build --configuration production
```

## 🔒 Segurança

### ⚠️ Arquivos Ignorados (não commitar):

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `.env`
- `.env.local`
- `node_modules/`

Ver `.gitignore` para lista completa.

### ✅ Arquivos Seguros (commitar):

- `src/environments/environment.example.ts`
- `src/environments/environment.prod.example.ts`
- `.gitignore`

## 🗄️ Setup Supabase

Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para:

- ✅ Criar projeto Supabase
- ✅ Configurar tabelas e storage
- ✅ Testar sincronização

## 📝 Estrutura do Projeto

```
sistema-igreja/
├── src/
│   ├── app/
│   │   ├── core/              # Serviços centralizados
│   │   ├── modules/           # Módulos de negócio
│   │   ├── shared/            # Componentes/modelos reutilizáveis
│   │   └── app.component.ts
│   ├── environments/          # Configurações por ambiente
│   ├── styles/               # Estilos globais
│   └── main.ts               # Entry point
├── dist/                      # Build output
├── angular.json              # Configuração Angular
├── tsconfig.json             # Configuração TypeScript
├── tailwind.config.ts        # Configuração Tailwind
├── .gitignore                # Git ignore rules
└── README.md                 # Este arquivo
```

## 🚀 Fluxo de Desenvolvimento

1. **Clone e setup** → `npm install && cp environments/*example*`
2. **Adicione credenciais** → `environment.ts`
3. **Desenvolvimento** → `npm start`
4. **Build** → `npm run build`
5. **Deploy** → Configurar credenciais no servidor

## 🐛 Troubleshooting

### Supabase não inicializado?

```
Verifique src/environments/environment.ts
Confirme que URL e anonKey estão corretas
```

### Erro de chaves faltando?

```
Copie environment.example.ts para environment.ts
Adicione suas credenciais do Supabase
```

### Build falhando?

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentação

- [Angular Docs](https://angular.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📞 Suporte

Para problemas ou dúvidas, consulte:

1. Este README
2. SUPABASE_SETUP.md
3. Documentação oficial dos projetos

---

**Desenvolvido com ❤️ para Sistema Igreja**
