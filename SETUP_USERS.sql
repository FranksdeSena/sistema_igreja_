-- ============================================================================
-- SCRIPT DE CRIAÇÃO DE USUÁRIOS (SUPABASE)
-- ============================================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard > SQL Editor
-- 2. Cole este script e execute.
-- 3. IMPORTANTE: Este script cria apenas os registros na tabela 'public.users'.
--    Você DEVE criar os usuários na aba Authentication PRIMEIRO, ou usar a função abaixo.
-- ============================================================================

-- Função auxiliar para criar usuário se não existir (Requer extensão pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Inserir ADMIN (Se já criou no Auth, use o ID real. Se não, este é um exemplo)
-- Substitua 'SEU_UUID_AQUI' pelo ID do usuário que você criou em Authentication > Users
-- Exemplo: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

-- 1. Inserir ADMIN (Se já criou no Auth, use o ID real. Se não, este é um exemplo)
-- Substitua 'SEU_UUID_AQUI' pelo ID do usuário que você criou em Authentication > Users
-- Exemplo: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

-- Se você acabou de criar o usuário 'frme@ibn.com' no Authentication:
INSERT INTO public.users (id, email, full_name, role, church_id)
SELECT 
    id, 
    email, 
    'Administrador Principal', 
    'admin', 
    'church-1'
FROM auth.users 
WHERE email = 'frme@ibn.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Se você criou o usuário 'admin@igreja.com' (exemplo antigo):
INSERT INTO public.users (id, email, full_name, role, church_id)
SELECT 
    id, 
    email, 
    'Admin Exemplo', 
    'admin', 
    'church-1'
FROM auth.users 
WHERE email = 'admin@igreja.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- 2. Inserir PASTOR (Crie o usuário pastor@igreja.com no Auth primeiro)
INSERT INTO public.users (id, email, full_name, role, church_id)
SELECT 
    id, 
    email, 
    'Pastor João', 
    'pastor', 
    'church-1'
FROM auth.users 
WHERE email = 'pastor@igreja.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'pastor';

-- 3. Inserir SECRETÁRIA (Crie o usuário secretaria@igreja.com no Auth primeiro)
INSERT INTO public.users (id, email, full_name, role, church_id)
SELECT 
    id, 
    email, 
    'Secretária Maria', 
    'secretaria', 
    'church-1'
FROM auth.users 
WHERE email = 'secretaria@igreja.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'secretaria';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT email, role, full_name FROM public.users;
