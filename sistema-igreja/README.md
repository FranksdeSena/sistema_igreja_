# 🏛️ Sistema Igreja - IBN Peniel

Sistema completo de gestão para igrejas desenvolvido com Angular e Firebase, incluindo dashboard administrativo e site público institucional.

![Angular](https://img.shields.io/badge/Angular-20.3-red?logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-12.6-orange?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)

## 📋 Sobre o Projeto

O **Sistema Igreja** é uma solução completa para gestão de igrejas que integra:
- **Dashboard Administrativo**: Gestão completa de membros, finanças, eventos, ministérios e células
- **Site Público Institucional**: Página institucional dinâmica com informações da igreja
- **Área do Pastor**: Gerenciamento de sermões, palavras e mensagens
- **Sistema de Auditoria**: Log completo de todas as ações do sistema

## ✨ Funcionalidades

### 🔐 Dashboard Administrativo

#### Gestão de Membros
- ✅ Cadastro completo de membros (dados pessoais, contato, endereço)
- ✅ Campo de gênero para diferenciação de avatares
- ✅ Controle de status (Ativo, Inativo, Visitante)
- ✅ Definição de funções/cargos
- ✅ Sincronização automática de líderes para área pública
- ✅ Aniversariantes do mês

#### Gestão Financeira
- ✅ Registro de dízimos e ofertas
- ✅ Controle de despesas
- ✅ Categorização de transações
- ✅ Relatórios financeiros
- ✅ Dashboard com gráficos

#### Gestão de Eventos
- ✅ Criação e edição de eventos
- ✅ Categorias (Culto, Reunião, Social, Missão, etc.)
- ✅ Controle de status (Agendado, Realizado, Cancelado)
- ✅ Agenda pública

#### Área do Pastor
- ✅ Gerenciamento de sermões com links do YouTube
- ✅ Palavra do Pastor (versículo da semana)
- ✅ Publicação de mensagens

#### Ministérios e Células
- ✅ Cadastro de ministérios
- ✅ Gestão de células
- ✅ Associação de líderes

#### Galeria de Mídia
- ✅ Upload de fotos e vídeos para Firebase Storage
- ✅ Organização por categorias
- ✅ Controle de visualizações e curtidas

#### Testemunhos e Pedidos de Oração
- ✅ Sistema de moderação de testemunhos
- ✅ Formulário público de pedidos de oração
- ✅ Aprovação e publicação

#### Sistema de Auditoria
- ✅ Log de todas as ações (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- ✅ Rastreamento por usuário e módulo
- ✅ Exportação de relatórios em CSV

### 🌐 Site Público Institucional

#### Páginas Dinâmicas
- ✅ **Home**: Hero section, próximos eventos, palavra do pastor, estatísticas
- ✅ **Sobre**: História e missão da igreja
- ✅ **Liderança**: Pastores e equipe de intercessão (com emojis por gênero 👨👩)
- ✅ **Agenda**: Calendário de eventos
- ✅ **Mensagens**: Últimos sermões com integração YouTube
- ✅ **Galeria**: Fotos e vídeos dos eventos
- ✅ **Testemunhos**: Histórias de vidas transformadas
- ✅ **Pedidos de Oração**: Formulário público
- ✅ **Contato**: Informações e formulário

#### Recursos
- ✅ Design responsivo (mobile-first)
- ✅ Carrossel de fotos
- ✅ Integração com YouTube
- ✅ Aniversariantes do mês
- ✅ Estatísticas em tempo real

## 🚀 Tecnologias Utilizadas

### Frontend
- **Angular 20.3** - Framework SPA moderno
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **RxJS 7.8** - Programação reativa

### Backend & Infraestrutura
- **Firebase Authentication** - Autenticação de usuários
- **Cloud Firestore** - Banco de dados NoSQL em tempo real
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Hosting** - Hospedagem do site
- **Firestore Security Rules** - Regras de segurança

### Ferramentas
- **Angular CLI 20.3** - Ferramenta de desenvolvimento
- **Firebase CLI** - Deploy e gerenciamento
- **Git** - Controle de versão

## 📁 Arquitetura do Projeto

```
sistema-igreja/
├── src/
│   ├── app/
│   │   ├── core/                      # Serviços principais e guards
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts      # Proteção de rotas autenticadas
│   │   │   │   └── session.guard.ts   # Controle de sessão única
│   │   │   └── services/
│   │   │       ├── firebase-auth.service.ts
│   │   │       ├── members-database.service.ts
│   │   │       ├── finance-database.service.ts
│   │   │       ├── events-database.service.ts
│   │   │       ├── pastor-database.service.ts
│   │   │       ├── media-database.service.ts
│   │   │       ├── audit.service.ts
│   │   │       └── ...
│   │   ├── modules/                   # Módulos lazy-loaded
│   │   │   ├── auth/                  # Login
│   │   │   ├── dashboard/             # Dashboard principal
│   │   │   ├── members/               # Gestão de membros
│   │   │   ├── finance/               # Gestão financeira
│   │   │   ├── events/                # Gestão de eventos
│   │   │   ├── pastor/                # Área do pastor
│   │   │   ├── ministries/            # Ministérios
│   │   │   ├── cells/                 # Células
│   │   │   ├── testimonies/           # Testemunhos
│   │   │   ├── prayer-requests/       # Pedidos de oração
│   │   │   ├── audit/                 # Auditoria
│   │   │   └── public/                # Site público
│   │   │       ├── home/
│   │   │       ├── about/
│   │   │       ├── leadership/
│   │   │       ├── schedule/
│   │   │       ├── sermons/
│   │   │       ├── gallery/
│   │   │       ├── testimonies-public/
│   │   │       ├── prayer-form/
│   │   │       └── contact/
│   │   ├── shared/                    # Componentes e modelos compartilhados
│   │   │   ├── models/
│   │   │   └── components/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts             # Configuração de desenvolvimento
│   │   └── environment.prod.ts        # Configuração de produção (gitignored)
│   ├── styles.scss                    # Estilos globais
│   └── index.html
├── firestore.rules                    # Regras de segurança do Firestore
├── firestore.indexes.json             # Índices do Firestore
├── firebase.json                      # Configuração do Firebase
├── tailwind.config.js                 # Configuração do Tailwind
├── angular.json                       # Configuração do Angular
├── package.json
└── README.md
```

## 🗄️ Estrutura do Banco de Dados (Firestore)

### Coleções Principais

#### `members` (Privada - Requer Autenticação)
```typescript
{
  id: string;
  churchId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  birthDate?: Date;
  gender?: 'masculino' | 'feminino';
  joinDate: Date;
  status: 'active' | 'inactive' | 'visiting';
  role?: string;
  photo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `public_leaders` (Pública - Leitura Aberta)
```typescript
{
  id: string;
  name: string;
  role: string;
  photo?: string;
  email?: string;
  gender?: string;
  updatedAt: string;
}
```
> **Nota**: Sincronizada automaticamente quando membros com cargo de "Pastor" ou "Intercessão" são criados/editados.

#### `finance` (Privada)
```typescript
{
  id: string;
  churchId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description?: string;
  paymentMethod?: string;
  createdAt: Date;
}
```

#### `events` (Pública para leitura)
```typescript
{
  id: string;
  churchId: string;
  name: string;
  category: 'Culto' | 'Reunião' | 'Treinamento' | 'Social' | 'Missão' | 'Outra';
  date: Date;
  time: string;
  location?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}
```

#### `pastor_words` (Pública para leitura)
```typescript
{
  id: string;
  churchId: string;
  title: string;
  content: string;
  authorName: string;
  isActive: boolean;
  createdAt: Date;
}
```

#### `sermons` (Pública para leitura)
```typescript
{
  id: string;
  churchId: string;
  title: string;
  pastor: string;
  date: Date;
  mediaUrl?: string;
  scriptureReference?: string;
  createdAt: Date;
}
```

#### `media` (Pública para leitura)
```typescript
{
  id: string;
  churchId: string;
  title: string;
  description?: string;
  type: 'photo' | 'video' | 'document';
  mediaUrl: string;
  status: 'draft' | 'published';
  views?: number;
  likes?: number;
  createdAt: Date;
}
```

#### `testimonies` (Moderada)
```typescript
{
  id: string;
  churchId: string;
  authorName: string;
  title: string;
  content: string;
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  isPublic: boolean;
  createdAt: Date;
}
```

#### `prayer_requests` (Moderada)
```typescript
{
  id: string;
  churchId: string;
  name: string;
  email?: string;
  phone?: string;
  request: string;
  status: 'pending' | 'prayed';
  isPublic: boolean;
  createdAt: Date;
}
```

#### `audit_logs` (Privada - Apenas Admin)
```typescript
{
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  details?: string;
  timestamp: Date;
}
```

## 🔐 Segurança

### Firestore Security Rules

O sistema implementa regras de segurança rigorosas:

- **Autenticação obrigatória** para acesso ao dashboard
- **Controle de permissões** por função (admin, pastor, secretária)
- **Dados públicos separados** (coleção `public_leaders` para site)
- **Proteção de dados sensíveis** (LGPD compliance)
- **Auditoria completa** de todas as ações

### Sessão Única

- Sistema de controle de sessão única por usuário
- Invalidação automática de sessões anteriores
- Persistência de sessão com `browserLocalPersistence`

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 22.x ou superior
- **npm** 10.x ou superior
- **Angular CLI** 20.x
- **Firebase CLI** (para deploy)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-igreja.git
cd sistema-igreja

# Instale as dependências
npm install
```

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative os serviços:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Storage
   - Hosting
3. Copie as credenciais do Firebase
4. Crie o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJECT.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
  }
};
```

5. Configure as regras de segurança:

```bash
# Deploy das regras do Firestore
firebase deploy --only firestore:rules
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm start

# Acesse em http://localhost:4200/
```

### Build de Produção

```bash
# Build otimizado para produção
ng build --configuration production

# Deploy para Firebase Hosting
firebase deploy --only hosting
```

## 👤 Credenciais de Acesso

### Usuário Administrador Padrão

```
Email: frme@ibn.com
Senha: frme1206
```

> **Importante**: Altere essas credenciais após o primeiro acesso!

### Criar Novo Usuário Admin

Use o Dashboard → Usuários → Novo Usuário

## 🎨 Tema e Design

### Paleta de Cores

- **Azul Principal**: `#2563EB` (primary-blue)
- **Laranja**: `#F97316` (primary-orange)
- **Cinza de Fundo**: `#F3F4F6` (background-gray)
- **Texto**: `#111827` (gray-900)

### Design System

- **Mobile-First**: Design responsivo priorizando dispositivos móveis
- **Tailwind CSS**: Classes utilitárias para estilização rápida
- **Componentes Reutilizáveis**: Cards, botões, formulários padronizados
- **Animações Suaves**: Transições e hover effects

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Principal)

### Site Público
![Site Público](https://via.placeholder.com/800x400?text=Site+Público)

### Gestão de Membros
![Membros](https://via.placeholder.com/800x400?text=Gestão+de+Membros)

## 🔄 Sincronização de Dados

### Líderes Públicos

O sistema sincroniza automaticamente membros com cargo de liderança para a coleção pública:

1. Ao criar/editar um membro com cargo "Pastor" ou "Intercessão"
2. O método `syncPublicLeader()` é acionado
3. Dados seguros são copiados para `public_leaders`:
   - Nome
   - Cargo
   - Foto
   - Email (opcional)
   - Gênero (para emoji correto: 👨/👩)

### Migração Inicial

Para sincronizar líderes existentes:

1. Faça login no Dashboard
2. Clique no botão "🔄 Migrar Líderes" (topo direito)
3. Confirme a operação

## 📝 Licença

Este projeto é proprietário e de uso exclusivo da Igreja Batista Nacional Peniel.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Franks Sena** para a IBN Peniel.

---

**Status do Projeto**: ✅ Produção | 🔄 Manutenção Contínua

**URL de Produção**: https://sistema-igreja-68c7a.web.app

**Última Atualização**: Dezembro 2025
