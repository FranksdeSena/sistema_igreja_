# 🎨 Design System - Sistema Igreja

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Spacing & Layout](#spacing--layout)
4. [Componentes](#componentes)
5. [Padrão de Módulos](#padrão-de-módulos)
6. [Breakpoints Responsivos](#breakpoints-responsivos)
7. [Ícones & Emojis](#ícones--emojis)

---

## 🎨 Paleta de Cores

### Cores Primárias

```
Primary Blue:    #2563EB (Logo, Botões, Links)
Dark Blue:       #1E40AF (Hover de botões)
Light Blue:      #DBEAFE (Fundo cards)
```

### Cores Secundárias

```
Yellow:          #FBBF24 (Ativo, Destaque, CTA)
Dark Yellow:     #D97706 (Hover yellow)
Orange:          #F97316 (Alerta, Visitantes)
Red:             #DC2626 (Erro, Delete, Crítico)
Green:           #16A34A (Sucesso, Ativo)
Gray:            #6B7280 (Texto secundário)
```

### Cores de Background

```
Background Gray: #F9FAFB (Fundo principal)
Card White:      #FFFFFF (Cards, Modals)
Sidebar Blue:    #1E3A8A (Escuro sidebar)
```

---

## 📝 Tipografia

### Hierarquia de Fontes

| Elemento                | Tamanho            | Peso           | Uso                   |
| ----------------------- | ------------------ | -------------- | --------------------- |
| H1 (Títulos principais) | 28px (text-3xl)    | bold (700)     | Títulos de página     |
| H2 (Subtítulos)         | 20px (text-xl)     | semibold (600) | Seções, Cards títulos |
| H3 (Sub-seções)         | 18px (text-lg)     | semibold (600) | Grupos de formulário  |
| Body (Padrão)           | 14px (text-sm)     | normal (400)   | Textos gerais         |
| Small (Secundário)      | 12px (text-xs)     | normal (400)   | Labels, Datas         |
| Extra Small             | 10px (text-[10px]) | normal (400)   | Badges, Tags          |

### Classes Tailwind

```tailwind
/* Títulos */
.title-main      → text-3xl font-bold text-gray-900
.title-section   → text-xl font-semibold text-gray-900
.title-subsec    → text-lg font-semibold text-gray-900

/* Textos */
.text-primary    → text-sm text-gray-900
.text-secondary  → text-sm text-gray-600
.text-muted      → text-xs text-gray-500
```

---

## 📐 Spacing & Layout

### Unidades Padrão (Tailwind)

```
xs: 4px   (space-1)
sm: 8px   (space-2)
md: 12px  (space-3)
lg: 16px  (space-4)
xl: 24px  (space-6)
2xl: 32px (space-8)
```

### Margens Padrão

```
Container padding:      px-8 py-6  (mobile: px-4 py-4)
Card padding:           p-6        (mobile: p-4)
Section gap:            gap-6      (mobile: gap-4)
List items gap:         gap-4      (mobile: gap-2)
```

### Layout Principal

```
Sidebar width:    w-64 (desktop) → hidden (mobile)
Main content:     ml-64 (desktop) → ml-0 (mobile)
Max width cards:  max-w-6xl
Grid cols:        grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

---

## 🧩 Componentes

### Botões

#### Primário (CTA)

```html
<button class="btn-primary">💾 Salvar</button>

/* Classe */ .btn-primary { @apply px-4 py-2 bg-primary-blue text-white rounded-lg font-semibold
hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed; }
```

#### Secundário

```html
<button class="btn-secondary">❌ Cancelar</button>

.btn-secondary { @apply px-4 py-2 border border-gray-300 text-gray-900 rounded-lg font-semibold
hover:bg-gray-50 transition-colors duration-200; }
```

#### Danger

```html
<button class="btn-danger">🗑️ Deletar</button>

.btn-danger { @apply px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-700
transition-colors; }
```

### Cards

#### Card Padrão

```html
<div class="card">Conteúdo do card</div>

.card { @apply bg-white rounded-lg shadow p-6 border border-gray-100; }
```

#### Card com Hover

```html
<div class="card-hover">Conteúdo interativo</div>

.card-hover { @apply bg-white rounded-lg shadow p-6 border border-gray-100 hover:shadow-lg
hover:border-primary-blue transition-all duration-200 cursor-pointer; }
```

### Badges

#### Badge Status

```html
<span class="badge badge-success">Ativo</span>
<span class="badge badge-warning">Visitante</span>
<span class="badge badge-danger">Inativo</span>

.badge { @apply inline-block px-3 py-1 rounded-full text-xs font-semibold; } .badge-success { @apply
bg-green-100 text-green-800; } .badge-warning { @apply bg-orange-100 text-orange-800; }
.badge-danger { @apply bg-red-100 text-red-800; } .badge-primary { @apply bg-blue-100 text-blue-800;
}
```

### Inputs

#### Input Field

```html
<input type="text" class="input-field" placeholder="..." />

.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue
focus:border-transparent transition-all; }
```

### Tables

#### Tabela Responsiva

```html
<table class="w-full">
  <thead class="bg-background-gray">
    <tr>
      <th class="px-6 py-3 text-left text-xs font-semibold">Nome</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
    <tr class="hover:bg-background-gray transition-colors">
      <td class="px-6 py-2">Conteúdo</td>
    </tr>
  </tbody>
</table>
```

---

## 🏗️ Padrão de Módulos

### Estrutura Padrão

```
modules/
├── finance/
│   ├── finance.component.ts          (Listagem Principal)
│   ├── finance-form.component.ts     (Criar/Editar)
│   ├── finance-detail.component.ts   (Detalhe - Opcional)
│   ├── finance.service.ts            (Lógica CRUD)
│   ├── finance-layout.component.ts   (Layout com sidebar)
│   ├── finance.routes.ts             (Rotas aninhadas)
│   └── finance.model.ts              (Interfaces)
```

### Padrão de Componente

#### 1. Listagem (finance.component.ts)

```typescript
@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Header com busca -->
    <!-- Stats Cards -->
    <!-- Tabela/Lista -->
  `,
})
export class FinanceComponent implements OnInit {
  items: Transaction[] = [];
  searchQuery = '';

  constructor(private service: FinanceService) {}

  ngOnInit(): void {
    this.loadItems();
  }
  loadItems(): void {
    /* ... */
  }
  onSearch(): void {
    /* ... */
  }
  onDelete(id: string): void {
    /* ... */
  }
}
```

#### 2. Formulário (finance-form.component.ts)

```typescript
@Component({
  selector: 'app-finance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Formulário com seções -->
    <!-- Botões Salvar/Cancelar -->
  `
})
export class FinanceFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private service: FinanceService,
    private route: ActivatedRoute,
    private router: Router
  ) { this.form = this.fb.group({...}); }

  ngOnInit(): void { /* carregar dados */ }
  onSubmit(): void { /* criar/atualizar */ }
  onCancel(): void { this.router.navigate(['...']); }
}
```

#### 3. Service (finance.service.ts)

```typescript
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private itemsSubject = new BehaviorSubject<Transaction[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  getItems(): Observable<Transaction[]> {
    return this.items$;
  }
  getItemById(id: string): Observable<Transaction | undefined> {
    /* ... */
  }
  addItem(item: Omit<Transaction, 'id'>): Observable<Transaction> {
    /* ... */
  }
  updateItem(id: string, item: Transaction): Observable<Transaction> {
    /* ... */
  }
  deleteItem(id: string): Observable<void> {
    /* ... */
  }
  searchItems(query: string): Observable<Transaction[]> {
    /* ... */
  }
}
```

---

## 📱 Breakpoints Responsivos

### Tailwind Breakpoints

```
sm: 640px   - Celulares grandes
md: 768px   - Tablets
lg: 1024px  - Notebooks
xl: 1280px  - Desktops
2xl: 1536px - Ultra wide
```

### Padrão de Layout

#### Mobile First

```html
<!-- Padrão mobile -->
<div class="grid grid-cols-1 space-y-4">
  <!-- Uma coluna, cards empilhados -->
</div>

<!-- Tablets+ -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Duas colunas -->
</div>

<!-- Desktops+ -->
<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  <!-- Múltiplas colunas -->
</div>
```

### Sidebar Responsivo

```html
<!-- Desktop -->
<aside class="w-64 fixed h-full">Sidebar</aside>
<main class="ml-64">Conteúdo</main>

<!-- Mobile (usar hidden sm:block) -->
<aside class="hidden sm:block w-64 fixed h-full">Sidebar</aside>
<main class="w-full sm:ml-64">Conteúdo</main>
```

### Texto Responsivo

```html
<!-- Headers -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">Título Principal</h1>

<!-- Padding -->
<div class="px-4 md:px-6 lg:px-8 py-4 md:py-6">Conteúdo</div>

<!-- Grid -->
<table class="hidden md:table">
  <!-- Desktop table -->
</table>
<div class="md:hidden">
  <!-- Mobile card view -->
</div>
```

---

## 🎭 Ícones & Emojis

### Ícones por Módulo

```
Dashboard:   📊
Membros:     👥
Finance:     💰
Events:      📅
Pastor:      📖
Secretaria:  📋
Settings:    ⚙️
Logout:      🚪
Back:        ←
Add:         ➕
Edit:        ✏️
Delete:      🗑️
Search:      🔍
Save:        💾
Close:       ❌
Success:     ✅
Warning:     ⚠️
Error:       ❌
Info:        ℹ️
Home:        🏠
Profile:     👤
Clock:       🕐
Check:       ✓
```

### Badges Status

```
Ativo:       ✅ Verde
Inativo:     ❌ Cinza
Visitante:   🤝 Laranja
Pendente:    ⏳ Amarelo
Bloqueado:   🚫 Vermelho
Processando: ⏳ Azul
```

---

## 📐 Exemplo Prático - Card de Membro

### Desktop (1024px+)

```
┌─────────────────────────────────────────┐
│ 👤 João Silva      Status: ✅ Ativo   │
│ 📱 (11) 98765-4321  Função: Líder      │
│ 📍 São Paulo, SP    Entrada: 15/11/24  │
│ [✏️ Editar] [🗑️ Deletar]              │
└─────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌──────────────────────┐
│ 👤 João Silva        │
│ 📱 (11) 98765-4321   │
│ Status: ✅ Ativo     │
│ [✏️] [🗑️]            │
└──────────────────────┘
```

### Mobile (<768px)

```
┌──────────────┐
│ 👤 João Silva│
│ 📱 98765-4321│
│ ✅ Ativo     │
│ [✏️] [🗑️]    │
└──────────────┘
```

---

## 🔄 Estados de Interação

### Botões

- **Normal**: Cor primária
- **Hover**: Cor mais escura + sombra leve
- **Active**: Cor mais escura + sem sombra
- **Disabled**: Opacidade 50% + cursor not-allowed
- **Loading**: Spinner + texto "Salvando..."

### Inputs

- **Default**: Borda cinza
- **Focus**: Anel azul (#2563EB) + borda azul
- **Error**: Borda vermelha + mensagem erro
- **Disabled**: Fundo cinza claro + cursor not-allowed

### Links/Menus

- **Default**: Texto azul
- **Hover**: Azul mais escuro + underline
- **Active**: Amarelo (#FBBF24) + texto azul escuro
- **Visited**: Azul mais escuro (opcional)

---

## ✅ Checklist de Consistência

Antes de criar qualquer nova página/módulo, verifique:

- [ ] Usar cores da paleta definida
- [ ] Respeitar hierarquia de tipografia
- [ ] Aplicar spacing correto (px-4 md:px-6 lg:px-8)
- [ ] Cards com `card` ou `card-hover`
- [ ] Botões com `btn-primary`, `btn-secondary`, `btn-danger`
- [ ] Badges com classes corretas
- [ ] Inputs com `input-field`
- [ ] Responsivo: mobile-first com breakpoints
- [ ] Ícones/emojis consistentes
- [ ] Estado active no menu lateral
- [ ] Botão "Voltar" em sub-rotas
- [ ] Loading states em botões
- [ ] Validações visíveis em inputs
- [ ] Acessibilidade (alt, aria-labels, labels)
- [ ] Performance (lazy loading, images otimizadas)

---

**Última atualização**: 15/11/2025
**Versão**: 1.0
**Status**: ✅ Ativo
