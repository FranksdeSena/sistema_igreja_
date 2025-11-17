# 📱 Guia Mobile-First - Sistema Igreja

## 📋 Princípios

1. **Mobile First**: Desenhar para mobile primeiro, depois expandir
2. **Touch-Friendly**: Botões mínimo 44x44px para toque
3. **Readability**: Fontes legíveis sem zoom
4. **Performance**: Assets otimizados para celular
5. **Offline Ready**: App funciona sem internet (futuro PWA)

---

## 📐 Breakpoints e Layouts

### Breakpoints (Tailwind)

```
Mobile:   < 640px   (sm:)
Tablet:   640-1024px (md:)
Desktop:  > 1024px  (lg:, xl:)
```

### Layout Principal

#### Mobile (< 640px)

```
Full width sidebar overlay (drawer)
- 75% screen width
- Slide-in animation
- Backdrop blur

Main content full width
```

#### Tablet (640-1024px)

```
Sidebar 200px fixed
Main content responsive
Grid 2 colunas
```

#### Desktop (> 1024px)

```
Sidebar 256px (w-64) fixed
Main content com max-width
Grid 3-4 colunas
```

---

## 🧩 Componentes Mobile-Optimized

### 1. Navbar Mobile

```html
<header class="sticky top-0 z-50 bg-white shadow">
  <div class="px-4 py-3 flex items-center justify-between">
    <!-- Logo -->
    <div class="text-2xl font-bold">⛪</div>

    <!-- Menu toggle -->
    <button class="lg:hidden p-2 rounded-lg hover:bg-gray-100" (click)="toggleMenu()">☰</button>

    <!-- Right icons -->
    <div class="flex gap-2">
      <button class="p-2">🔔</button>
      <button class="p-2">⚙️</button>
    </div>
  </div>
</header>
```

### 2. Sidebar Responsivo

```html
<!-- Desktop sidebar -->
<aside class="hidden lg:block w-64 bg-primary-blue text-white fixed h-full">
  <!-- Menu aqui -->
</aside>

<!-- Mobile drawer -->
<div class="fixed inset-0 z-40 lg:hidden" [class.block]="menuOpen" [class.hidden]="!menuOpen">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50" (click)="toggleMenu()"></div>

  <!-- Drawer -->
  <aside class="relative w-3/4 bg-primary-blue text-white h-full">
    <!-- Menu aqui -->
  </aside>
</div>
```

### 3. Card Mobile-Friendly

```html
<!-- Desktop: Side by side -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">
    <!-- Conteúdo -->
  </div>
</div>

<!-- Mobile: Full width, sem padding excessivo -->
@media (max-width: 640px) { .card { @apply p-4 mx-2; /* Menos padding */ } }
```

### 4. Tabela Mobile (Card List)

```html
<!-- Desktop: Tabela normal -->
<table class="hidden md:table w-full">
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of items">
      <td>{{ item.name }}</td>
      <td>{{ item.email }}</td>
      <td><span class="badge">{{ item.status }}</span></td>
      <td>
        <button class="btn-sm">✏️</button>
        <button class="btn-sm">🗑️</button>
      </td>
    </tr>
  </tbody>
</table>

<!-- Mobile: Card list -->
<div class="md:hidden space-y-3">
  <div *ngFor="let item of items" class="card">
    <div class="flex justify-between items-start mb-3">
      <h3 class="font-semibold text-sm">{{ item.name }}</h3>
      <span class="badge badge-sm">{{ item.status }}</span>
    </div>
    <p class="text-xs text-gray-600 mb-3">{{ item.email }}</p>
    <div class="flex gap-2">
      <button class="btn-primary btn-sm flex-1">✏️ Editar</button>
      <button class="btn-danger btn-sm flex-1">🗑️ Deletar</button>
    </div>
  </div>
</div>
```

### 5. Formulário Mobile-Optimized

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
  <!-- Campo full-width -->
  <div>
    <label class="block text-sm font-medium mb-2">Nome *</label>
    <input
      type="text"
      formControlName="name"
      class="input-field w-full"
      placeholder="Nome completo"
    />
    <span
      *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
      class="text-xs text-red-600"
    >
      Campo obrigatório
    </span>
  </div>

  <!-- Dois campos em linha (desktop) ou stack (mobile) -->
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

  <!-- Botões stack no mobile -->
  <div class="flex flex-col md:flex-row gap-3 pt-4">
    <button type="submit" class="btn-primary flex-1">💾 Salvar</button>
    <button type="button" (click)="onCancel()" class="btn-secondary flex-1">❌ Cancelar</button>
  </div>
</form>
```

### 6. Botões Mobile-Friendly

```html
<!-- Desktop: Ícone + Texto -->
<button class="btn-primary">✏️ Editar</button>

<!-- Mobile: Ícone apenas ou full-width -->
<button class="btn-primary md:hidden">✏️</button>
<button class="btn-primary hidden md:block">✏️ Editar</button>

<!-- Ou sempre full-width em modal -->
<button class="btn-primary w-full md:w-auto">✏️ Editar</button>
```

### 7. Modais/Drawers Mobile

```html
<!-- Desktop: Modal -->
<div class="hidden md:flex fixed inset-0 items-center justify-center">
  <div class="bg-white rounded-lg p-6 max-w-md">Conteúdo</div>
</div>

<!-- Mobile: Bottom sheet -->
<div class="md:hidden fixed bottom-0 left-0 right-0">
  <div class="bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-auto">Conteúdo</div>
</div>
```

---

## 🎨 Tipografia Mobile

### Ajustes por Breakpoint

```html
<!-- Headlines responsivas -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">Título Grande</h1>

<h2 class="text-xl md:text-2xl font-semibold">Título Médio</h2>

<p class="text-sm md:text-base text-gray-600">Texto corpo responsivo</p>

<!-- Labels e hints -->
<label class="block text-xs md:text-sm font-medium"> Label do campo </label>
<span class="text-[10px] md:text-xs text-gray-500"> Dica de ajuda </span>
```

### Espaçamento Responsivo

```html
<!-- Container -->
<div class="px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
  <!-- Padding responsivo -->
</div>

<!-- Gap em grids -->
<div class="grid gap-2 md:gap-4 lg:gap-6">
  <!-- Gap responsivo -->
</div>

<!-- Margins -->
<div class="mb-2 md:mb-4 lg:mb-6">
  <!-- Margin responsivo -->
</div>
```

---

## 🖼️ Imagens e Media

### Imagens Responsivas

```html
<!-- Avatar -->
<img src="user.jpg" class="w-10 h-10 md:w-12 md:h-12 rounded-full" />

<!-- Card image -->
<img src="event.jpg" class="w-full h-32 md:h-48 lg:h-64 object-cover rounded-lg" />
```

### Ícones/Emojis

```html
<!-- Icones escaláveis -->
<span class="text-xl md:text-2xl lg:text-3xl">📊</span>

<!-- SVG responsivo -->
<svg class="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24">
  <!-- SVG content -->
</svg>
```

---

## 📊 Exemplo: Card de Membro Responsivo

### HTML

```html
<div class="card">
  <div class="flex gap-3 md:gap-4">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <span class="text-3xl md:text-4xl">👤</span>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h3 class="text-sm md:text-base font-semibold truncate">{{ member.name }}</h3>
      <p class="text-xs md:text-sm text-gray-600">📱 {{ member.phone }}</p>
      <div class="flex gap-2 mt-2 flex-wrap">
        <span class="badge badge-sm md:badge"> {{ member.status }} </span>
        <span class="badge badge-primary badge-sm md:badge"> {{ member.role }} </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-1 md:flex-row md:gap-2 flex-shrink-0">
      <button class="btn-primary btn-sm md:btn">✏️</button>
      <button class="btn-danger btn-sm md:btn">🗑️</button>
    </div>
  </div>
</div>
```

### Renderização

**Mobile:**

```
┌─────────────────────┐
│ 👤 João Silva       │
│    📱 98765-4321    │
│    ✅ Ativo | Líder │
│ [✏️] [🗑️]          │
└─────────────────────┘
```

**Tablet:**

```
┌──────────────────────────────────────┐
│ 👤  João Silva                       │
│     📱 (11) 98765-4321               │
│     ✅ Ativo   | 👥 Líder            │
│                    [✏️ Editar] [🗑️]  │
└──────────────────────────────────────┘
```

**Desktop:**

```
┌────────────────────────────────────────────────┐
│ 👤  João Silva   📱 (11) 98765-4321            │
│ ✅ Ativo   | 👥 Líder   Entrada: 15/11/24     │
│                    [✏️ Editar] [🗑️ Deletar]    │
└────────────────────────────────────────────────┘
```

---

## ✅ Checklist Mobile

Antes de finalizar um componente, verifique:

- [ ] Responsivo em 375px (iPhone SE)
- [ ] Responsivo em 768px (iPad)
- [ ] Responsivo em 1024px (Laptop)
- [ ] Botões mínimo 44x44px (toque confortável)
- [ ] Inputs com placeholder legível
- [ ] Sem scroll horizontal
- [ ] Fontes legíveis sem zoom
- [ ] Tabelas convertidas para cards em mobile
- [ ] Formulários full-width em mobile
- [ ] Espaçamento consistente
- [ ] Ícones escalam bem
- [ ] Imagens carregam rápido
- [ ] Touch targets têm espaço entre eles
- [ ] Loading states visíveis
- [ ] Mensagens de erro claras
- [ ] Dark mode compatível (futura)

---

## 🚀 Performance Mobile

### Otimizações

1. **Images**

   - Usar WebP com fallback
   - Lazy load images
   - Responsive images (srcset)

2. **CSS**

   - Usar Tailwind (junta Classes)
   - Purge unused CSS
   - Minify em produção

3. **JavaScript**

   - Code splitting
   - Tree-shaking
   - Lazy load components

4. **Network**
   - Gzip compression
   - Cache assets
   - Service Workers (PWA)

---

## 📋 Template Base Para Novos Módulos

```typescript
@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Mobile: Apenas conteúdo -->
    <div class="lg:ml-64 min-h-screen bg-background-gray">
      <!-- Header mobile-friendly -->
      <header class="sticky top-0 z-40 bg-white shadow">
        <div class="px-4 py-3 flex items-center gap-4">
          <button class="lg:hidden">☰</button>
          <h1 class="text-xl md:text-2xl font-bold">Módulo</h1>
        </div>
      </header>

      <!-- Conteúdo -->
      <main class="px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <!-- Grid responsivo -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <!-- Cards aqui -->
        </div>
      </main>
    </div>
  `,
})
export class ModuleComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
```

---

**Data**: 15/11/2025
**Versão**: 1.0
**Status**: ✅ Ativo
