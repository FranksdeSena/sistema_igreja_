# 📋 Módulo de Membros - Documentação

## Visão Geral

O módulo de membros oferece um CRUD (Create, Read, Update, Delete) completo para gerenciar os membros da igreja, com interface intuitiva e responsiva.

## 🎯 Funcionalidades Implementadas

### 1. **Listagem de Membros** (`members.component.ts`)

#### Características:
- ✅ Exibição em tabela responsiva
- ✅ Busca em tempo real (nome, email, telefone)
- ✅ Cards de estatísticas (Total, Ativos, Visitantes)
- ✅ Status badges com cores dinâmicas
- ✅ Foto do membro (emoji)
- ✅ Links para WhatsApp e Email
- ✅ Ações de edição e deleção

#### Cards de Estatísticas:
```
Total de Membros: 3
Membros Ativos: 3
Visitantes: 0
```

#### Colunas da Tabela:
- 👤 Nome (com data de entrada)
- 📧 Email (link clicável)
- 💬 WhatsApp (link para iniciar conversa)
- 🏷️ Status (Ativo/Inativo/Visitante)
- 💼 Função (Líder/Membro/etc)
- ⚙️ Ações (Editar/Deletar)

### 2. **Formulário de Criar/Editar Membro** (`member-form.component.ts`)

#### Seções do Formulário:

##### **Informações Básicas**
- Nome Completo (obrigatório, mín. 3 caracteres)
- Email (obrigatório, validação de email)
- Telefone (obrigatório)
- WhatsApp (obrigatório)
- Data de Nascimento (opcional)
- Data de Entrada (obrigatório)

##### **Status e Função**
- Status: Ativo / Inativo / Visitante
- Função: Líder, Membro, Presbítero, etc

##### **Endereço**
- Rua/Logradouro
- Cidade
- Estado (máx 2 caracteres)
- CEP

#### Validações:
- ✅ Campos obrigatórios
- ✅ Formato de email
- ✅ Comprimento mínimo de nome
- ✅ Estados com 2 caracteres

#### Feedback:
- ✅ Desabilitação do botão se formulário inválido
- ✅ Mensagens de erro por campo
- ✅ Loading state durante envio
- ✅ Redirecionamento após sucesso

### 3. **Serviço de Membros** (`members.service.ts`)

#### Métodos Disponíveis:

```typescript
// Obter todos os membros
getMembers(): Observable<Member[]>

// Obter membro por ID
getMemberById(id: string): Observable<Member | undefined>

// Criar novo membro
addMember(member: Partial<Member>): Observable<Member>

// Atualizar membro existente
updateMember(id: string, member: Partial<Member>): Observable<Member | null>

// Deletar membro
deleteMember(id: string): Observable<boolean>

// Pesquisar membros
searchMembers(query: string): Observable<Member[]>
```

#### Dados de Exemplo:
O serviço inclui 3 membros de exemplo:
1. **Maria Silva** - Líder de Célula
2. **João Santos** - Membro
3. **Ana Costa** - Membro

## 🗂️ Estrutura de Arquivos

```
modules/members/
├── members.component.ts           # Listagem de membros
├── member-form.component.ts       # Formulário criar/editar
├── members-layout.component.ts    # Layout wrapper
├── members.routes.ts              # Rotas do módulo
└── index.ts                       # Exportações
```

## 🛣️ Rotas

```
/members                 # Listagem de membros
/members/novo           # Criar novo membro
/members/editar/:id     # Editar membro existente
```

## 🎨 Design e UX

### Cores Utilizadas:
- **Primária (Azul)**: #2563EB - Botões principais
- **Secundária (Amarelo)**: #FBBF24 - Ações secundárias
- **Alerta (Vermelho)**: #DC2626 - Deleção
- **Sucesso (Verde)**: Natural para status ativo

### Componentes Reutilizáveis:
- `card` - Container de conteúdo
- `card-hover` - Card com efeito hover
- `btn-primary` - Botão primário
- `input-field` - Campo de entrada
- `badge` - Tags de status
- `badge-success` - Badge verde
- `badge-warning` - Badge amarela

### Responsividade:
- ✅ Mobile: Tabela com scroll horizontal
- ✅ Tablet: Grid 1-2 colunas
- ✅ Desktop: Grid 1-3+ colunas

## 📱 Fluxo de Uso

### Criar Membro:
1. Clique em "Novo Membro" na listagem
2. Preencha o formulário
3. Clique em "Salvar"
4. Redirecionado para a listagem

### Editar Membro:
1. Na listagem, clique no ícone "✏️"
2. Formulário carrega dados do membro
3. Edite os dados
4. Clique em "Atualizar"
5. Redirecionado para a listagem

### Deletar Membro:
1. Na listagem, clique no ícone "🗑️"
2. Confirme a exclusão
3. Membro removido da lista

### Pesquisar Membro:
1. Na listagem, digite na barra de busca
2. Digite nome, email ou telefone
3. Clique "Buscar"
4. Tabela é filtrada em tempo real

## 🔄 Estado da Aplicação

### BehaviorSubject (Reatividade):
O `MembersService` usa `BehaviorSubject` para manter sincronização em tempo real entre componentes. Quando um membro é criado, editado ou deletado, todos os componentes inscritos recebem a atualização automaticamente.

### Cache em Memória:
- ✅ Dados armazenados em memória durante a sessão
- ⚠️ Será substituído por integração Supabase em futuras atualizações

## 🚀 Próximos Passos

- [ ] Integrar com Supabase (dados persistentes)
- [ ] Adicionar paginação para grandes listas
- [ ] Importar membros via CSV
- [ ] Exportar membros para Excel/PDF
- [ ] Foto de perfil com upload
- [ ] Histórico de alterações
- [ ] Filtros avançados (status, função, célula)
- [ ] Integração com WhatsApp Business API

## 📝 Exemplo de Uso

```typescript
// No componente
constructor(private membersService: MembersService) {}

ngOnInit() {
  // Obter todos os membros
  this.membersService.getMembers().subscribe(members => {
    this.members = members;
  });
}

// Adicionar membro
const newMember = {
  name: 'Pedro Santos',
  email: 'pedro@exemplo.com',
  phone: '(11) 99999-8888',
  whatsapp: '(11) 99999-8888',
  joinDate: new Date(),
  status: 'active',
  churchId: 'church-1'
};

this.membersService.addMember(newMember).subscribe(
  created => console.log('Membro criado:', created)
);
```

## ✅ Testes Manuais

1. **Listagem**: ✅ Exibe 3 membros de exemplo
2. **Novo Membro**: ✅ Formulário funciona e adiciona à lista
3. **Editar Membro**: ✅ Carrega dados e atualiza
4. **Deletar Membro**: ✅ Remove com confirmação
5. **Buscar**: ✅ Filtra por nome/email/telefone
6. **Validações**: ✅ Mostra erros em campos obrigatórios
7. **Layout**: ✅ Responsivo em todas as telas
8. **Navegação**: ✅ Integrada com sidebar do dashboard

---

**Status**: ✅ Completo e Funcional | **Última atualização**: 15/11/2025
