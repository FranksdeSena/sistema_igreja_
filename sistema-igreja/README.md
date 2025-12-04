# 🏛️ Sistema Igreja - IBN Peniel

Sistema completo de gestão para igrejas desenvolvido com Angular e Firebase, incluindo dashboard administrativo e site público institucional.

![Angular](https://img.shields.io/badge/Angular-20.3-red?logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-12.6-orange?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)

## 📋 Sobre o Projeto

Sistema consolidado que oferece funcionalidades essenciais para gestão completa de igrejas:

- **Cadastro de Membros** (com número do WhatsApp integrado)
- **Gestão de Células** (grupos pequenos)
- **Gestão de Eventos** (agenda e calendário)
- **Área do Pastor** (palavra do pastor, estudos bíblicos, sermões)
- **Gestão Financeira** (dízimos, ofertas, despesas com relatórios e export CSV)
- **Auditoria Completa** (log de todas as ações do sistema)
- **Dashboard Integrado** (com todas as páginas e relatórios)
- **Comunicação** (e-mail/WhatsApp)
- **Site Público Institucional** (home, liderança, agenda, mensagens, galeria, testemunhos, contato)

## 👥 Níveis de Usuários

O sistema possui **3 níveis de usuários** com permissões diferenciadas:

### 🔴 Admin
- Poder total sobre o sistema
- Pode excluir, editar e criar outros usuários
- Gerencia permissões de usuários existentes
- Acesso completo a todos os módulos

### 🟡 Pastor
- Acesso à área pastoral
- Gerenciamento de sermões e mensagens
- Visualização de relatórios
- Sem permissão para excluir usuários

### 🟢 Secretário(a)
- Cadastro e edição de membros
- Gestão de eventos e células
- Lançamento de finanças
- Acesso limitado a configurações

## 🔐 Autenticação e Segurança

- **Firebase Authentication** (Supabase Auth como alternativa)
- **RBAC** (Role-Based Access Control) - Admin / Pastor / Secretaria
- **Sessão Única** - Controle de sessão por usuário
- **Firestore Security Rules** - Proteção de dados sensíveis
- **Auditoria Completa** - Log de todas as ações (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)

## ✨ Funcionalidades Principais

### � Dashboard Principal

Resumo executivo com:
- **Quantidade de membros** (ativos, inativos, visitantes)
- **Palavra do Pastor** (versículo da semana)
- **Batismo** (data de início e fim das palestras)
- **Tema da última pregação** com seus versículos
- **Mural estilo carrossel infinito** (imagens, fotos, vídeos)
- **Aniversariantes do mês** em destaque

### 👥 Gestão de Membros

- Cadastro completo (dados pessoais, contato, endereço)
- Campo de **gênero** (para diferenciação de avatares 👨👩)
- Número do **WhatsApp** integrado
- Controle de status (Ativo, Inativo, Visitante)
- Definição de funções/cargos
- **Sincronização automática** de líderes para área pública
- Aniversariantes do mês

### 💰 Dízimos / Finanças / Ofertas

- Lançar doações (dízimos e ofertas)
- Registrar despesas
- **Relatórios financeiros** detalhados
- **Export CSV** para análise externa
- **Lançamentos via PIX** (integração futura)
- Categorização de transações
- Dashboard com gráficos

### 📅 Gestão de Eventos

- Criação e edição de eventos
- Categorias (Culto, Reunião, Social, Missão, Treinamento)
- Controle de status (Agendado, Realizado, Cancelado)
- Agenda pública no site

### ✝️ Área do Pastor

- Gerenciamento de **sermões** (com links do YouTube)
- **Palavra do Pastor** (versículo da semana)
- Publicação de mensagens e estudos bíblicos
- Histórico de pregações

### 🏠 Ministérios e Células

- Cadastro de ministérios
- Gestão de células (grupos pequenos)
- Associação de líderes e membros
- Relatórios de participação

### 📸 Galeria de Mídia

- Upload de fotos e vídeos para **Firebase Storage**
- Organização por categorias
- Controle de visualizações e curtidas
- Mural estilo carrossel infinito

### 💬 Testemunhos e Pedidos de Oração

- **Sistema de moderação** de testemunhos
- Formulário público de pedidos de oração
- Aprovação e publicação
- Exibição no site público

### 📧 Comunicação

- Integração com **e-mail**
- Integração com **WhatsApp**
- Envio de mensagens em massa (planejado)

### 📋 Auditoria

- Log de todas as ações do sistema
- Rastreamento por usuário e módulo
- Exportação de relatórios em CSV
- Filtros por data, usuário e ação

## 🌐 Site Público Institucional

### Páginas Dinâmicas

- ✅ **Home**: Hero section, próximos eventos, palavra do pastor, estatísticas, carrossel de fotos
- ✅ **Sobre**: História e missão da igreja
- ✅ **Liderança**: Pastores e equipe de intercessão (com emojis por gênero 👨👩)
- ✅ **Agenda**: Calendário de eventos públicos
- ✅ **Mensagens**: Últimos sermões com integração YouTube
- ✅ **Galeria**: Fotos e vídeos dos eventos
- ✅ **Testemunhos**: Histórias de vidas transformadas
- ✅ **Pedidos de Oração**: Formulário público
- ✅ **Contato**: Informações e formulário

### Recursos

- ✅ Design responsivo (mobile-first)
- ✅ Carrossel de fotos automático
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
- **Firebase Storage** - Armazenamento de arquivos (fotos, vídeos)
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
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts             # Configuração de desenvolvimento
│   │   └── environment.prod.ts        # Configuração de produção
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
Cadastro completo de membros com dados pessoais, contato e endereço.

#### `public_leaders` (Pública - Leitura Aberta)
Sincronizada automaticamente quando membros com cargo de "Pastor" ou "Intercessão" são criados/editados.
Contém apenas dados seguros: nome, cargo, foto, email, gênero.

#### `finance` (Privada)
Dízimos, ofertas e despesas com categorização e relatórios.

#### `events` (Pública para leitura)
Eventos da igreja (cultos, reuniões, eventos sociais, missões).

#### `pastor_words` (Pública para leitura)
Palavra do pastor (versículo da semana).

#### `sermons` (Pública para leitura)
Sermões e pregações com links do YouTube.

#### `media` (Pública para leitura)
Fotos e vídeos dos eventos (Firebase Storage).

#### `testimonies` (Moderada)
Testemunhos de membros com sistema de aprovação.

#### `prayer_requests` (Moderada)
Pedidos de oração com controle de privacidade.

#### `audit_logs` (Privada - Apenas Admin)
Log completo de todas as ações do sistema.

## 🔐 Segurança

### Firestore Security Rules

- **Autenticação obrigatória** para acesso ao dashboard
- **RBAC** (Role-Based Access Control) - Admin / Pastor / Secretaria
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
git clone https://github.com/futurannetdesign/sistema_igreja_.git
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

### Criar Novo Usuário

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
