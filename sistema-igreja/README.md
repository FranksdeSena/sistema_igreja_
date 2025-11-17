# Sistema Igreja - Frontend (Angular)

## 📋 Sobre o Projeto

Aplicação web para gestão completa de igrejas com funcionalidades de cadastro de membros, gestão financeira, eventos, área do pastor e secretaria.

## 🚀 Tecnologias Utilizadas

- **Angular 20.3** - Framework Frontend moderno
- **Tailwind CSS 3.4.1** - Styling responsivo
- **TypeScript** - Tipagem forte
- **RxJS** - Programação reativa
- **Lazy Loading** - Carregamento de módulos sob demanda

## ✅ Arquitetura do Projeto

```
src/
├── app/
│   ├── core/                 # Serviços, Guards, Interceptadores
│   ├── modules/             # Módulos com lazy loading
│   │   ├── auth/            # Autenticação (login)
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── members/         # Gestão de membros
│   │   ├── finance/         # Gestão financeira
│   │   ├── events/          # Eventos e agenda
│   │   ├── pastor/          # Área do pastor
│   │   └── secretaria/      # Área da secretária
│   ├── shared/              # Componentes, modelos, pipes reutilizáveis
│   ├── app.component.ts     # Componente raiz
│   ├── app.config.ts        # Configurações do app
│   └── app.routes.ts        # Rotas da aplicação
├── styles.scss              # Estilos globais + Tailwind
└── index.html               # Template HTML
```

## 🎨 Tema de Cores

- **Azul Principal**: #2563EB
- **Amarelo**: #FBBF24
- **Laranja**: #F97316
- **Vermelho**: #DC2626
- **Branco**: #FFFFFF

## 🔐 Autenticação

### Credenciais de Teste

```
Email: admin@igreja.com
Senha: 123456
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 22.x ou superior
- npm 10.x ou superior

### Instalação

```bash
cd sistema-igreja
npm install
```

### Desenvolvimento

```bash
npm start
# Acessar em http://localhost:4200/
```

### Build de Produção

```bash
npm run build
```

## ✨ Funcionalidades Implementadas

- ✅ Login com autenticação
- ✅ Dashboard principal com cards de resumo
- ✅ Layout responsivo com sidebar
- ✅ Lazy loading de módulos
- ✅ Proteção de rotas com AuthGuard
- ✅ Tema moderno com Tailwind CSS

## 🔜 Próximas Etapas

- [ ] Integração com Supabase Auth
- [ ] CRUD de membros
- [ ] Gestão de dízimos e ofertas
- [ ] Gestão de eventos
- [ ] Dashboard com gráficos

---

**Status**: ✅ Estrutura base concluída | 🔄 Em desenvolvimento

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
