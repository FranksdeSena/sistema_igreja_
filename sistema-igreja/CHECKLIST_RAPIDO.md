# ✅ CHECKLIST DE FORMATAÇÃO - Rápido Copiar/Colar

> Use este checklist ANTES de commitar novas páginas!

---

## 📋 Stats Cards (Dashboard) - Template Pronto

### ✅ Copiar/Colar Este Exato Template

⚠️ **CRÍTICO: NÚMEROS COMPLETOS SEM TRUNCATE**

```html
<!-- Stats Cards Container -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
  <!-- Card Individual -->
  <div class="card-hover p-4 md:p-5">
    <!-- Label (truncate OK aqui) -->
    <p class="text-gray-600 text-xs md:text-sm mb-2 truncate">Label Curto</p>

    <!-- Número + Emoji (flex layout) -->
    <div class="flex items-end justify-between gap-3">
      <!-- NÚMERO: break-words (permite quebra), NUNCA truncate -->
      <p class="text-lg md:text-xl font-bold text-green-600 break-words">R$ 5.400,00</p>

      <!-- Emoji (não encolhe) -->
      <span class="flex-shrink-0 text-lg md:text-xl opacity-20">💰</span>
    </div>
  </div>

  <!-- Repetir <div class="card-hover"> para cada stat -->
</div>
```

### Classes Críticas (NUNCA mudar)

```
❌ NUNCA truncate em números    → Corta valores (770... é ERRADO!)
✅ break-words nos números      → Permite quebra de linha se necessário
✅ text-lg md:text-xl           → Tamanho profissional (não text-2xl+)
✅ flex-shrink-0                → Emoji não encolhe
✅ gap-3 md:gap-4               → Espaçamento responsivo
✅ p-4 md:p-5                   → Padding gerador de espaço
✅ opacity-20                   → Emoji não compete com texto
✅ break-words                  → Palavra PODE quebrar para próxima linha
```

### ⚠️ Anti-Padrões (NÃO FAÇA)

```html
❌
<p class="truncate">R$ {{ value }}</p>
<!-- ERRADO: corta números -->
❌
<p class="text-2xl md:text-3xl">...</p>
<!-- ERRADO: muito grande -->
❌
<div class="gap-2">...</div>
<!-- ERRADO: muito apertado -->
❌
<p class="text-xs">R$ 5.400,00</p>
<!-- ERRADO: muito pequeno -->

✅
<p class="break-words">R$ {{ value }}</p>
<!-- CERTO: preserva números -->
✅
<p class="text-lg md:text-xl">...</p>
<!-- CERTO: tamanho proporcional -->
✅
<div class="gap-3 md:gap-4">...</div>
<!-- CERTO: respira bem -->
✅
<p class="text-sm md:text-base">...</p>
<!-- CERTO: legível -->
```

---

## 📱 Mobile Card Template (Listagem)

### ✅ Copiar/Colar

```html
<!-- Mobile Cards Container -->
<div class="md:hidden space-y-3">
  <div *ngFor="let item of items" class="card-hover p-3">
    <!-- Header: Título + Valor -->
    <div class="flex justify-between items-start gap-2 mb-2">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{{ item.title }}</p>
        <p class="text-xs text-gray-600 mt-0.5">{{ item.date | date: 'dd/MM/yyyy' }}</p>
      </div>
      <span class="flex-shrink-0 text-sm md:text-base font-bold text-green-600">
        R$ {{ item.amount }}
      </span>
    </div>

    <!-- Tags/Badges -->
    <div class="flex gap-2 mb-2 flex-wrap">
      <span class="badge text-xs">{{ item.category }}</span>
      <span class="badge text-xs">Status</span>
    </div>

    <!-- Ações -->
    <div class="flex gap-2">
      <button class="flex-1 btn-primary text-xs py-2">Editar</button>
      <button class="flex-1 btn-danger text-xs py-2">Deletar</button>
    </div>
  </div>
</div>
```

### Classes Críticas

```
✅ p-3                    → Padding padrão mobile
✅ space-y-3              → Gap entre cards
✅ text-sm font-semibold  → Título legível
✅ text-xs                → Badges/subtextos pequenos
✅ flex-wrap              → Badges quebram linha se needed
✅ py-2                   → Botões com altura mínima
```

---

## 📊 Tabela Desktop Template

### ✅ Copiar/Colar

```html
<!-- Tabela Desktop -->
<div class="hidden md:block card-hover overflow-x-auto">
  <table class="w-full text-sm">
    <thead class="bg-gray-100">
      <tr>
        <th class="px-3 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">Coluna 1</th>
        <th class="px-3 py-2 text-left text-xs md:text-sm font-semibold text-gray-700">Coluna 2</th>
        <th class="px-3 py-2 text-center text-xs md:text-sm font-semibold text-gray-700">Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let item of items" class="border-t hover:bg-gray-50 transition">
        <td class="px-3 py-2 text-xs md:text-sm text-gray-800">{{ item.data1 }}</td>
        <td class="px-3 py-2 text-xs md:text-sm text-gray-800 truncate">{{ item.data2 }}</td>
        <td class="px-3 py-2 text-center">
          <div class="flex gap-1 md:gap-2 justify-center text-xs md:text-sm">
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium"> ✏️ Editar </a>
            <button class="text-red-600 hover:text-red-800 font-medium">🗑️ Deletar</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Classes Críticas

```
✅ px-3 py-2                     → Padding reduzido (3px/2px)
✅ text-xs md:text-sm            → Fonte pequena/responsiva
✅ truncate                       → Texto longo não quebra
✅ text-center                    → Ações centralizadas
✅ hover:bg-gray-50 transition   → Efeito ao passar mouse
✅ border-t                       → Separador entre linhas
```

---

## 🔘 Header Template

### ✅ Copiar/Colar

```html
<!-- Header -->
<div class="flex items-center justify-between gap-4">
  <div class="flex-1 min-w-0">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Título</h1>
    <p class="text-xs md:text-sm text-gray-600 mt-1">Descrição curta</p>
  </div>
  <button class="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
    <span class="text-lg">➕</span>
    <span class="hidden md:inline">Novo Item</span>
    <span class="md:hidden">Novo</span>
  </button>
</div>
```

### Classes Críticas

```
✅ flex-1 min-w-0              → Título não quebra layout
✅ text-2xl md:text-3xl        → MÁXIMO de tamanho
✅ text-xs md:text-sm          → Descrição pequena
✅ whitespace-nowrap           → Botão não quebra linha
✅ hidden md:inline            → Esconde texto em mobile
```

---

## 🎨 Filtros Template

### ✅ Copiar/Colar

```html
<!-- Filtros -->
<div class="card p-3 md:p-4">
  <div class="flex flex-col md:flex-row gap-2 md:gap-3">
    <select class="input-field flex-1 text-sm">
      <option>Opção 1</option>
      <option>Opção 2</option>
    </select>

    <select class="input-field flex-1 text-sm">
      <option>Opção A</option>
      <option>Opção B</option>
    </select>
  </div>
</div>
```

### Classes Críticas

```
✅ p-3 md:p-4          → Padding responsivo
✅ gap-2 md:gap-3      → Gap pequeno, cresce em desktop
✅ text-sm             → Fonte padrão para selects
✅ flex-col md:flex-row → Empilha em mobile, linha em desktop
```

---

## ⚠️ NÃO FAZER (Anti-Patterns)

```typescript
❌ text-5xl ou text-6xl em dashboards
❌ text-4xl md:text-5xl (muito grande mesmo responsivo)
❌ Ícones sem opacity-20
❌ gap-6 md:gap-8 (muito espaçamento)
❌ p-6 md:p-8 (muito padding)
❌ Flexbox sem flex-1 min-w-0 (overflow!)
❌ Emojis grandes em botões
❌ 3+ emojis em um card
❌ Sem truncate em textos longos
```

---

## ✅ Fazer (Best Practices)

```typescript
✅ text-2xl md:text-3xl lg:text-4xl (progressivo)
✅ text-xs md:text-sm (labels pequenos)
✅ gap-3 md:gap-4 (espaçamento controlado)
✅ p-3 md:p-4 (padding responsivo)
✅ flex-1 min-w-0 em todos flex containers
✅ truncate ou break-words para texto longo
✅ opacity-20 em todos os emojis de fundo
✅ text-sm md:text-base para ícones de ação
✅ Testar em 3 tamanhos: 375px, 768px, 1024px
```

---

## 🧪 Teste Rápido

Antes de commitar, verificar:

```
[ ] Mobile (375px): Cards não quebram?
[ ] Tablet (768px): Layout mudou corretamente?
[ ] Desktop (1024px+): Está bonito?
[ ] Números não saem do card?
[ ] Emojis estão com opacity-20?
[ ] Tabelas rolam horizontalmente em mobile?
[ ] Botões têm altura mínima 40px?
[ ] Sem textos cortados abruptamente?
[ ] Nenhum text-5xl ou maior em cards?
```

---

## 🚀 Copiar Rápido (Snippet)

### Stats Card (1 minuto)

1. Copie a seção `<!-- Stats Cards Container -->` do template
2. Cole em `<div class="space-y-6">` na página
3. Adapte os dados e cores
4. Done! ✅

### Mobile Cards (2 minutos)

1. Copie `<!-- Mobile Cards Container -->`
2. Adapte o \*ngFor e binding dos dados
3. Ajuste categorias/badges
4. Done! ✅

### Tabela (2 minutos)

1. Copie `<!-- Tabela Desktop -->`
2. Adapte colunas e dados
3. Adicione lógica de editar/deletar
4. Done! ✅

---

## 📞 Dúvidas?

Se algo não estiver claro:

1. Abra `PADROES_ESCALAS.md`
2. Procure por "text-" ou "gap-" ou "p-"
3. Veja exemplos reais em `finance.component.ts`
4. Copie e adapte!

---

**Última atualização**: 15/11/2025
**Status**: 🟢 PRONTO PARA USAR
