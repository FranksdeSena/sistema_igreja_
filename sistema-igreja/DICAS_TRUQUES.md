# 💡 Dicas & Truques - Sistema Igreja

## 🛠️ Desenvolvimento Rápido

### 1. Copiar & Adaptar Padrões

**Estrutura Members** → Template para novos módulos

```bash
# Copiar estrutura de Members para novo módulo
cp -r src/app/modules/members src/app/modules/finance

# Renomear arquivos
cd src/app/modules/finance
mv members.component.ts finance.component.ts
mv members.service.ts finance.service.ts
# ... etc
```

### 2. Snippet para Novo Componente

```typescript
// Template rápido de componente
@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="title-main">Titulo</h1>
        <button routerLink="novo" class="btn-primary">➕ Novo</button>
      </div>

      <!-- Busca -->
      <div class="card">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          class="input-field flex-1"
          placeholder="Buscar..."
        />
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card-hover">
          <p class="text-muted">Total</p>
          <p class="text-2xl font-bold text-primary-blue">{{ items.length }}</p>
        </div>
      </div>

      <!-- Tabela/Lista -->
      <div class="card">
        <table class="w-full hidden md:table">
          <!-- Desktop table -->
        </table>
        <div class="md:hidden space-y-3">
          <!-- Mobile cards -->
        </div>
      </div>
    </div>
  `,
})
export class FinanceComponent implements OnInit {
  items: any[] = [];
  searchQuery = '';

  constructor(private service: FinanceService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.service.getItems().subscribe((items) => {
      this.items = items;
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.service.searchItems(this.searchQuery).subscribe((items) => {
        this.items = items;
      });
    } else {
      this.loadItems();
    }
  }
}
```

### 3. Snippet para Service

```typescript
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private itemsSubject = new BehaviorSubject<Transaction[]>([
    // Mock data inicial
  ]);
  public items$ = this.itemsSubject.asObservable();

  constructor() {}

  getItems(): Observable<Transaction[]> {
    return this.items$;
  }

  getItemById(id: string): Observable<Transaction | undefined> {
    return of(this.itemsSubject.value.find((item) => item.id === id));
  }

  addItem(item: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Observable<Transaction> {
    const newItem: Transaction = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
    return of(newItem);
  }

  updateItem(id: string, item: Partial<Transaction>): Observable<Transaction | null> {
    const current = this.itemsSubject.value;
    const index = current.findIndex((i) => i.id === id);
    if (index === -1) return of(null);

    const updated = {
      ...current[index],
      ...item,
      updatedAt: new Date(),
    };
    current[index] = updated;
    this.itemsSubject.next([...current]);
    return of(updated);
  }

  deleteItem(id: string): Observable<void> {
    this.itemsSubject.next(this.itemsSubject.value.filter((item) => item.id !== id));
    return of(void 0);
  }

  searchItems(query: string): Observable<Transaction[]> {
    return of(
      this.itemsSubject.value.filter((item) =>
        item.description.toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}
```

---

## 🎨 Componentes Prontos Para Copiar

### Card Responsivo

```html
<div class="card">
  <div class="flex gap-4 md:gap-6">
    <div class="flex-shrink-0">
      <span class="text-3xl md:text-4xl">💰</span>
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-sm md:text-base font-semibold">Título</h3>
      <p class="text-xs md:text-sm text-gray-600">Subtítulo</p>
      <div class="flex gap-2 mt-2 flex-wrap">
        <span class="badge badge-sm">Status</span>
      </div>
    </div>
    <div class="flex gap-2 flex-shrink-0">
      <button class="btn-primary btn-sm">✏️</button>
      <button class="btn-danger btn-sm">🗑️</button>
    </div>
  </div>
</div>
```

### Tabela Responsiva

```html
<!-- Desktop -->
<table class="w-full hidden md:table">
  <thead class="bg-background-gray">
    <tr>
      <th class="px-6 py-3 text-left text-xs font-semibold">Coluna 1</th>
      <th class="px-6 py-3 text-left text-xs font-semibold">Coluna 2</th>
      <th class="px-6 py-3 text-left text-xs font-semibold">Ações</th>
    </tr>
  </thead>
  <tbody class="divide-y">
    <tr class="hover:bg-background-gray">
      <td class="px-6 py-2">Dado 1</td>
      <td class="px-6 py-2">Dado 2</td>
      <td class="px-6 py-2">
        <button class="btn-primary btn-sm">✏️</button>
        <button class="btn-danger btn-sm">🗑️</button>
      </td>
    </tr>
  </tbody>
</table>

<!-- Mobile -->
<div class="md:hidden space-y-3">
  <div class="card">
    <div class="grid grid-cols-2 gap-4 mb-3">
      <div>
        <p class="text-xs text-gray-600">Coluna 1</p>
        <p class="font-semibold">Dado 1</p>
      </div>
      <div>
        <p class="text-xs text-gray-600">Coluna 2</p>
        <p class="font-semibold">Dado 2</p>
      </div>
    </div>
    <div class="flex gap-2">
      <button class="btn-primary btn-sm flex-1">✏️ Editar</button>
      <button class="btn-danger btn-sm flex-1">🗑️</button>
    </div>
  </div>
</div>
```

### Formulário Responsivo

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 md:space-y-6">
  <!-- Campo simples -->
  <div>
    <label class="block text-sm font-medium mb-2">Nome *</label>
    <input
      type="text"
      formControlName="name"
      class="input-field w-full"
      placeholder="Digite aqui"
    />
    <span
      *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
      class="text-xs text-red-600"
    >
      Campo obrigatório
    </span>
  </div>

  <!-- Dois campos lado a lado -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium mb-2">Email</label>
      <input type="email" formControlName="email" class="input-field w-full" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-2">Telefone</label>
      <input type="tel" formControlName="phone" class="input-field w-full" />
    </div>
  </div>

  <!-- Seletor -->
  <div>
    <label class="block text-sm font-medium mb-2">Status</label>
    <select formControlName="status" class="input-field w-full">
      <option value="">Selecione...</option>
      <option value="active">Ativo</option>
      <option value="inactive">Inativo</option>
    </select>
  </div>

  <!-- Botões -->
  <div class="flex flex-col md:flex-row gap-3 pt-4">
    <button type="submit" class="btn-primary flex-1 md:flex-none" [disabled]="isLoading">
      <span *ngIf="!isLoading">💾 Salvar</span>
      <span *ngIf="isLoading">⏳ Salvando...</span>
    </button>
    <button type="button" (click)="onCancel()" class="btn-secondary flex-1 md:flex-none">
      ❌ Cancelar
    </button>
  </div>
</form>
```

---

## 🚀 Atalhos de Desenvolvimento

### Hot Reload

```bash
# Modificar arquivo = reload automático
# Modificar styles = reload automático
# Modificar template = rebuild + reload
```

### Debug Console

```typescript
// Adicionar em qualquer lugar
console.log('🔍 Debug:', data);
console.warn('⚠️ Warning:', data);
console.error('❌ Error:', data);

// DevTools: F12 → Console
```

### Testar em Mobile

```bash
# Via LAN (mesmo WiFi)
npm start

# Depois acessar de outro dispositivo:
http://SEU_IP:4200
# Ex: http://192.168.1.100:4200
```

### Build Rápido

```bash
# Desenvolvimento
npm start

# Produção (verificar bundle)
npm run build

# Watch mode
npm run watch
```

---

## 📱 Testes Responsivos

### DevTools (F12)

1. Abrir DevTools
2. Ctrl+Shift+M (device toolbar)
3. Selecionar dispositivo:
   - iPhone 12 Pro
   - iPad Air
   - MacBook Air

### Breakpoints Tailwind

```
320px   → Mobile pequeno
375px   → iPhone
640px   → sm: breakpoint
768px   → md: breakpoint (tablet)
1024px  → lg: breakpoint (laptop)
1280px  → xl: breakpoint (desktop)
```

### Testar Cada Breakpoint

1. **Mobile** (375px): Dados mínimos, botões grandes
2. **Tablet** (768px): Duas colunas, mais espaço
3. **Desktop** (1024px): Múltiplas colunas, layout completo

---

## 🎯 Otimizações de Performance

### Lazy Loading

```typescript
// Automático com Angular routing
const routes: Routes = [
  {
    path: 'finance',
    loadChildren: () => import('./modules/finance/finance.routes').then((m) => m.FINANCE_ROUTES),
  },
];
```

### Change Detection

```typescript
// Para componentes estáticos
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Unsubscribe

```typescript
// Use async pipe ou
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// No subscribe:
.pipe(takeUntil(this.destroy$))
```

---

## 🐛 Troubleshooting Rápido

### "Componente não aparece"

```bash
# Verificar:
1. Está importado em imports: []?
2. Está na rota correta?
3. Renovar build: Ctrl+C, npm start

# Console:
console.log('Component loaded');
```

### "Estilo não funciona"

```bash
# Tailwind precisa rebuild
npm start  # Ctrl+C e reiniciar

# Verificar classe existe em Tailwind:
<div class="text-3xl">  ✅ Existe
<div class="text-99xl"> ❌ Não existe (usar text-9xl)
```

### "Dados não carregam"

```bash
# Verificar Observable:
this.service.items$.subscribe(data => {
  console.log('✅ Dados:', data);  // Ver console
});

# Verificar loading state:
<p *ngIf="isLoading">Carregando...</p>
```

### "Mobile não responsivo"

```html
<!-- Faltou breakpoint? -->
<div class="text-xl md:text-2xl">
  ✅ Correto
  <div class="text-xl">
    ❌ Não muda em mobile

    <!-- Faltou gap? -->
    <div class="grid gap-4 md:gap-6">
      ✅ Correto
      <div class="grid gap-6">❌ Espaçamento errado mobile</div>
    </div>
  </div>
</div>
```

---

## 📊 Checklist Pré-Deploy

- [ ] Sem console.log() em produção
- [ ] Sem `any` types (usar Types)
- [ ] Formulários com validação visível
- [ ] Loading states em botões
- [ ] Error messages amigáveis
- [ ] Responsivo em 3 breakpoints
- [ ] Imagens otimizadas
- [ ] Bundle size < 50kB
- [ ] Performance score > 80
- [ ] Testes manuais OK

---

## 🎓 Recursos Úteis

### Documentação

- Angular: https://angular.io
- Tailwind: https://tailwindcss.com
- RxJS: https://rxjs.dev

### Comunidade

- Stack Overflow (tags: angular, tailwind)
- Reddit: r/Angular

### Ferramentas

- Angular DevTools (browser extension)
- Redux DevTools (debugging)
- Lighthouse (performance)

---

## 💡 Pro Tips

### 1. Use Operador Pipe

```typescript
// ❌ Ruim
items$.subscribe(data => {
  let filtered = data.filter(...);
  let mapped = filtered.map(...);
});

// ✅ Bom
items$.pipe(
  filter(data => ...),
  map(data => ...)
).subscribe(data => ...);
```

### 2. Use Async Pipe

```typescript
// ❌ Ruim
items: Item[];
ngOnInit() {
  this.service.items$.subscribe(data => {
    this.items = data;
  });
}

// ✅ Bom
items$ = this.service.items$;

<!-- Template -->
<div *ngFor="let item of items$ | async">
```

### 3. Use trackBy em \*ngFor

```typescript
// ✅ Otimizado
<div *ngFor="let item of items; trackBy: trackByFn">

trackByFn(index: number, item: Item) {
  return item.id;
}
```

### 4. Reutilize Modelos

```typescript
// ✅ Padrão consistente
export class ItemComponent implements OnInit {
  items: Item[] = [];
  searchQuery = '';
  isLoading = false;

  constructor(private service: ItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }
  loadItems(): void {
    /* ... */
  }
  onSearch(): void {
    /* ... */
  }
  onDelete(id): void {
    /* ... */
  }
}
```

---

## 🎊 Conclusão

Com estes snippets e dicas, você pode:

- ✅ Criar módulos rapidamente
- ✅ Manter consistência
- ✅ Otimizar performance
- ✅ Debugar problemas
- ✅ Testar responsividade

**Tempo de implementação reduzido em 50%! ⚡**

---

**Data**: 15/11/2025
**Versão**: 1.0
**Status**: ✅ Ativo
