# 📐 PADRÕES DE ESCALAS E TAMANHOS - Sistema Igreja

> **CRÍTICO**: Seguir este padrão em TODAS as páginas para evitar colapsos de layout!

---

## 🎯 Hierarquia de Tipografia

### Headers (Títulos)
```
H1 (Página): text-3xl font-bold        | Desktop: 30px | Tablet: 26px | Mobile: 24px
H2 (Seção): text-xl font-semibold      | Desktop: 20px | Tablet: 18px | Mobile: 16px
H3 (Cards): text-lg font-semibold      | Desktop: 18px | Tablet: 16px | Mobile: 14px
```

### Texto
```
Body: text-sm                           | Desktop: 14px | Tablet: 13px | Mobile: 12px
Small: text-xs                          | Desktop: 12px | Tablet: 11px | Mobile: 10px
Label: text-xs font-medium              | Desktop: 12px | Tablet: 11px | Mobile: 10px
```

### Números Grandes (Stats/Dashboard)
```
Número Grande: text-2xl md:text-4xl    | Desktop: 36px | Tablet: 28px | Mobile: 24px
Número Médio: text-xl md:text-2xl      | Desktop: 24px | Tablet: 20px | Mobile: 18px
Número Pequeno: text-lg md:text-xl     | Desktop: 20px | Tablet: 18px | Mobile: 16px
```

---

## 🎨 Ícones e Emojis

### Tamanhos MÁXIMOS Recomendados
```
Header Emoji:   text-4xl              | 36px (MÁXIMO em card titles)
Dashboard Icon: text-3xl opacity-20   | 30px (MÁXIMO em stats)
Button Icon:    text-lg md:text-xl    | 18-20px
Table Icon:     text-base             | 16px
```

### ⚠️ NÃO FAZER
```
❌ text-5xl ou text-6xl em cards/dashboards (QUEBRA LAYOUT!)
❌ Combinar emoji grande + texto grande no mesmo card
❌ Usar emojis sem opacity-20 em backgrounds
```

---

## 📦 Stats Cards (Dashboard)

### Padrão CORRETO - 3 Níveis

```html
<!-- Card Container -->
<div class="card-hover">
  <div class="flex items-center justify-between gap-4">
    
    <!-- Conteúdo Text (70%) -->
    <div class="flex-1">
      <!-- Label (12px) -->
      <p class="text-gray-600 text-xs md:text-sm">Total Receitas</p>
      
      <!-- Número (24-36px) -->
      <p class="text-2xl md:text-4xl font-bold text-green-600 mt-2">
        R$ 5.400
      </p>
      
      <!-- Optional: Subtext (10px) -->
      <p class="text-gray-500 text-xs mt-1">↑ 8% vs mês anterior</p>
    </div>
    
    <!-- Emoji (30px MÁXIMO, opacity-20) -->
    <div class="flex-shrink-0">
      <span class="text-3xl opacity-20">💰</span>
    </div>
    
  </div>
</div>
```

### Responsividade
```
Mobile (< 640px):  
  - Label: 10px
  - Número: 22px
  - Emoji: 28px (com opacity-20)
  - Gap: 8px

Tablet (640px - 1024px):
  - Label: 12px
  - Número: 28px
  - Emoji: 30px (com opacity-20)
  - Gap: 12px

Desktop (> 1024px):
  - Label: 14px
  - Número: 36px
  - Emoji: 30px (com opacity-20)
  - Gap: 16px
```

---

## 📋 Tabelas

### Tipografia Tabela
```
Header: text-sm font-semibold          | 12-14px
Cell:   text-sm                        | 12-14px
Badge:  text-xs font-medium            | 10-12px
Button: text-sm                        | 12-14px
```

### Sem Ícones Grandes em Tabelas!
```
❌ text-3xl para action buttons
✅ text-base para action buttons (16px)

❌ text-2xl para status badges
✅ text-xs para status badges (12px)
```

---

## 🔘 Buttons e Inputs

### Sizes
```
Button (Normal):
  Padding: px-4 py-2 (altura ~40px)
  Font: text-sm
  Min tap target: 44x44px (mobile)
  
Button (Small):
  Padding: px-3 py-1 (altura ~32px)
  Font: text-xs
  
Input/Select:
  Height: ~40px (h-10)
  Padding: px-3 py-2
  Font: text-sm
  Border: 1px
```

---

## 🎯 Grid Columns

### Layout Responsivo
```
1 Column:  grid-cols-1                      (Mobile)
2 Columns: md:grid-cols-2                   (Tablet min: 640px)
3 Columns: md:grid-cols-3 lg:grid-cols-3    (Desktop min: 768px)
4 Columns: lg:grid-cols-4                   (Desktop min: 1024px)
5 Columns: lg:grid-cols-5                   (Desktop min: 1024px)
```

### Gap Padrão
```
Mobile: gap-2 ou gap-3        (8-12px)
Tablet: gap-3 ou gap-4        (12-16px)
Desktop: gap-4 ou gap-6       (16-24px)
```

---

## 📱 Spacing (Padding & Margin)

### Card Padding
```
Mobile:  p-3 ou p-4          (12-16px)
Tablet:  p-4 ou p-5          (16-20px)
Desktop: p-6                 (24px)
```

### Section Spacing
```
Vertical: space-y-4 ou space-y-6
Horizontal: gap-4 ou gap-6
```

---

## 🎨 Exemplo Completo: Stats Card CORRETO

```typescript
// Template correto para Stats Card
<div class="card-hover">
  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 min-w-0">  <!-- min-w-0 evita overflow -->
      <!-- Label pequeno -->
      <p class="text-gray-600 text-xs md:text-sm truncate">
        Total Receitas
      </p>
      
      <!-- Número controlado -->
      <p class="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mt-1 break-words">
        R$ 5.400
      </p>
      
      <!-- Opcional: subtext pequeno -->
      <p class="text-gray-500 text-xs mt-1">↑ 8% vs anterior</p>
    </div>
    
    <!-- Emoji CONTROLADO -->
    <div class="flex-shrink-0 text-2xl md:text-3xl opacity-20">
      💰
    </div>
  </div>
</div>
```

---

## ⚙️ Classes Tailwind Obrigatórias

### Para evitar colapso:
```
Card: card card-hover (padrão com padding)
Flex: flex items-center justify-between gap-4
Truncate: truncate (truncar texto longo)
MinWidth: min-w-0 (flexbox context)
Break: break-words (quebrar palavras muito longas)
```

---

## 🚫 Regras de Ouro

1. **Nunca usar**:
   - ❌ `text-5xl` ou maior em cards/dashboards
   - ❌ Ícones sem `opacity-20` em backgrounds
   - ❌ `flex-grow` em elementos com emojis
   - ❌ Padding muito grande (máx p-6)

2. **Sempre usar**:
   - ✅ `flex-shrink-0` em elementos fixed (ícones)
   - ✅ `min-w-0` em flex containers com texto
   - ✅ `truncate` ou `break-words` para texto longo
   - ✅ `text-xs md:text-sm` para labels
   - ✅ `gap-4` entre elementos

3. **Responsive First**:
   - ✅ Mobile: `text-2xl`
   - ✅ Tablet: `md:text-3xl`
   - ✅ Desktop: `lg:text-4xl`

---

## 📋 Checklist para Novas Páginas

Antes de commitar, verificar:

- [ ] Headers: H1=text-3xl, H2=text-xl, H3=text-lg
- [ ] Números: text-2xl md:text-3xl lg:text-4xl (máximo)
- [ ] Ícones: text-3xl md:text-4xl (máximo) com opacity-20
- [ ] Labels: text-xs md:text-sm
- [ ] Cards: p-4 md:p-6 (máximo)
- [ ] Grid: gap-4 (responsivo)
- [ ] Buttons: h-10 com text-sm
- [ ] Inputs: h-10 com text-sm
- [ ] Mobile: Testado em 375px
- [ ] Tablet: Testado em 768px
- [ ] Desktop: Testado em 1024px+

---

## 🎯 Exemplos por Módulo

### Finance Module (Stats Cards)
```
✅ Label: text-xs md:text-sm
✅ Número: text-2xl md:text-3xl lg:text-4xl
✅ Emoji: text-3xl opacity-20 flex-shrink-0
✅ Gap: gap-4 entre conteúdo e emoji
```

### Members Module (Tabela)
```
✅ Header: text-sm font-semibold
✅ Cell: text-sm
✅ Action Button: text-sm (não emoji grande!)
✅ Badge: text-xs
```

### Events Module (Títulos)
```
✅ H1: text-3xl
✅ H2: text-xl
✅ Cards: text-lg
✅ Texto: text-sm
```

---

## 💡 Dica Pro

Se quiser um card SUPER escalável, use:

```html
<div class="card-hover p-4 md:p-6">
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <p class="text-xs md:text-sm text-gray-600 truncate">Label</p>
      <p class="text-2xl md:text-4xl font-bold mt-2">Conteúdo</p>
      <p class="text-xs md:text-sm text-gray-500 mt-1">Subtext</p>
    </div>
    <div class="flex-shrink-0 text-3xl opacity-20">📊</div>
  </div>
</div>
```

Isso funciona em TODOS os tamanhos de tela! 🚀

---

**Data**: 15/11/2025
**Versão**: 1.0
**Status**: 🟢 PADRÃO OFICIAL
