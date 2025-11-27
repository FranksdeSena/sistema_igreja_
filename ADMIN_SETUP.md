# 🔐 Configuração de Administrador

Este guia explica como gerenciar o acesso administrativo no Sistema Igreja.

## 1. Como saber minha senha de Admin?

Se você está rodando o sistema localmente pela primeira vez ou perdeu o acesso, você tem duas opções:

### Opção A: Verificar o Supabase (Recomendado)

1. Acesse o dashboard do seu projeto no [Supabase](https://supabase.com/dashboard).
2. Vá em **Authentication** > **Users**.
3. Procure pelo seu usuário (email).
4. Se você não sabe a senha, clique no menu (três pontos) e escolha **"Send password reset"** (se o email for válido) ou delete o usuário e crie novamente.

### Opção B: Criar um Novo Admin via SQL

Se você tem acesso ao **SQL Editor** do Supabase, pode transformar qualquer usuário em admin:

```sql
-- Substitua pelo email do usuário que você quer promover
UPDATE public.users
SET role = 'admin'
WHERE email = 'seu-email@exemplo.com';
```

## 2. Como criar o Primeiro Admin?

Se o banco de dados estiver vazio:

1. Cadastre-se normalmente na tela de Login/Cadastro (`/auth/register`).
2. Por padrão, novos usuários são `member`.
3. Vá no Supabase > SQL Editor e rode:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'seu-email-cadastrado@exemplo.com';
```

## 3. Testando o Acesso

1. Faça logout e login novamente.
2. No topo da tela (Header), você verá:
   - **Nome do Usuário**
   - Etiqueta **Administrador** (em vermelho)
3. Vá em **Membros**. Você deverá ver os botões de **Editar** e **Excluir**.

## 4. Troubleshooting

- **Não vejo a etiqueta Admin**: Verifique se você fez logout/login após alterar o papel no banco. O token precisa ser renovado.
- **Botões não aparecem**: Confirme se na tabela `public.users` a coluna `role` está exatamente como `admin` (minúsculo).
