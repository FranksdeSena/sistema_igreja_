-- ========================================
-- SISTEMA IGREJA - DATABASE SCHEMA
-- Supabase SQL Setup Completo
-- ========================================

-- 1. TABELA DE USUÁRIOS (AUTENTICAÇÃO)
-- Estende a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'secretaria', 'member')),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CELULAS (GRUPOS DE CÉLULAS) - Criar antes de MEMBERS pois members referencia cell_groups
CREATE TABLE IF NOT EXISTS public.cell_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID,
  location TEXT,
  meeting_day TEXT CHECK (meeting_day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  meeting_time TIME,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE MEMBROS
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Brazil',
  
  -- Status na Igreja
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'member', 'visitor')),
  join_date DATE DEFAULT CURRENT_DATE,
  baptism_date DATE,
  
  -- Categorias
  member_type TEXT CHECK (member_type IN ('regular', 'leader', 'staff', 'visitor')),
  cell_group_id UUID REFERENCES public.cell_groups(id) ON DELETE SET NULL,
  
  -- Preferências
  receive_notifications BOOLEAN DEFAULT true,
  receive_email BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Agora adicionar a FK de leader_id em cell_groups (circular dependency)
-- Remover constraint se existir (para idempotência)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.cell_groups 
    DROP CONSTRAINT IF EXISTS fk_cell_groups_leader;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  ALTER TABLE public.cell_groups 
  ADD CONSTRAINT fk_cell_groups_leader 
  FOREIGN KEY (leader_id) REFERENCES public.members(id) ON DELETE RESTRICT;
END $$;

-- 4. TABELA DE FINANÇAS
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  type TEXT NOT NULL CHECK (type IN ('tithe', 'offering', 'expense', 'other')),
  category TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  
  -- Rastreamento
  recorded_by UUID NOT NULL REFERENCES auth.users(id),
  recorded_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'debit', 'credit', 'transfer', 'pix')),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE EVENTOS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('service', 'celebration', 'meeting', 'training', 'other')),
  
  -- Data e Hora
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  
  -- Organização
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  max_attendance INTEGER,
  
  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE PRESENÇAS EM EVENTOS
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused')),
  check_in_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Evitar duplicatas
  UNIQUE(event_id, member_id)
);

-- 7. TABELA DE MENSAGENS DO PASTOR
CREATE TABLE IF NOT EXISTS public.daily_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  biblical_text TEXT,
  pastor_id UUID NOT NULL REFERENCES auth.users(id),
  tags TEXT[],
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Auditoria
  published_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA DE SERMÕES
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  description TEXT,
  biblical_text TEXT,
  pastor_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Mídia
  video_url TEXT,
  audio_url TEXT,
  
  -- Dados
  sermon_date DATE NOT NULL,
  duration INTEGER, -- em minutos
  attendance INTEGER,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE DOCUMENTOS (SECRETARIA)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  category TEXT,
  
  -- Arquivo
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Acesso
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'members', 'private', 'admin')),
  
  -- Auditoria
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABELA DE COMUNICAÇÕES
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'notification')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Destinatário
  recipient_type TEXT CHECK (recipient_type IN ('individual', 'group', 'all')),
  recipient_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  
  -- Agendamento
  scheduled_date TIMESTAMP WITH TIME ZONE,
  sent_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'scheduled')),
  
  -- Auditoria
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABELA DE RELATÓRIOS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  
  -- Conteúdo
  content TEXT,
  summary TEXT,
  
  -- Dados
  metrics JSONB, -- Armazena dados estruturados
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published', 'archived')),
  
  -- Auditoria
  created_by UUID NOT NULL REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABELA DE MÍDIA (FOTOS E VÍDEOS)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  church_id TEXT NOT NULL DEFAULT 'church-1',
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'document')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration INTEGER, -- em segundos
  
  -- Categorização
  category TEXT DEFAULT 'general',
  tags TEXT[],
  
  -- Autor
  uploaded_by TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted', 'syncing')),
  
  -- Engajamento
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. TABELA DE VISITAS (PASTOR)
CREATE TABLE IF NOT EXISTS public.pastoral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Detalhes
  visit_date DATE NOT NULL,
  visit_time TIME,
  duration INTEGER, -- em minutos
  purpose TEXT,
  notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABELA DE ANIVERSARIANTES
CREATE TABLE IF NOT EXISTS public.birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id TEXT NOT NULL DEFAULT 'church-1',
  member_id UUID NOT NULL UNIQUE REFERENCES public.members(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  
  -- Preferências
  send_notification BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_members_church ON public.members(church_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_cell_group ON public.members(cell_group_id);

CREATE INDEX IF NOT EXISTS idx_finances_church ON public.finances(church_id);
CREATE INDEX IF NOT EXISTS idx_finances_type ON public.finances(type);
CREATE INDEX IF NOT EXISTS idx_finances_date ON public.finances(recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_events_church ON public.events(church_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(start_date DESC);

CREATE INDEX IF NOT EXISTS idx_documents_church ON public.documents(church_id);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON public.documents(visibility);

CREATE INDEX IF NOT EXISTS idx_communications_church ON public.communications(church_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);

CREATE INDEX IF NOT EXISTS idx_media_church ON public.media(church_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media(status);

CREATE INDEX IF NOT EXISTS idx_daily_messages_church ON public.daily_messages(church_id);
CREATE INDEX IF NOT EXISTS idx_daily_messages_date ON public.daily_messages(published_date DESC);

CREATE INDEX IF NOT EXISTS idx_sermons_church ON public.sermons(church_id);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON public.sermons(sermon_date DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso para MEMBERS
CREATE POLICY "Members can view all members" 
ON public.members FOR SELECT 
USING (true);

CREATE POLICY "Admin can create members"
ON public.members FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Members can update themselves"
ON public.members FOR UPDATE
USING (auth.uid() = created_by OR auth.jwt() ->> 'role' = 'admin');

-- Políticas de Acesso para FINANCES
CREATE POLICY "Members can view finances"
ON public.finances FOR SELECT
USING (true);

CREATE POLICY "Secretaria and Admin can create finances"
ON public.finances FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' IN ('secretaria', 'admin'));

-- Políticas de Acesso para DOCUMENTS
CREATE POLICY "Public documents visible to all"
ON public.documents FOR SELECT
USING (visibility = 'public' OR auth.jwt() ->> 'role' IN ('admin', 'pastor', 'secretaria'));

CREATE POLICY "Admin can manage documents"
ON public.documents FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'secretaria'));

-- ========================================
-- FUNÇÕES SQL AUXILIARES
-- ========================================

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_views(media_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.media 
  SET views = views + 1, 
      updated_at = CURRENT_TIMESTAMP
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar likes
CREATE OR REPLACE FUNCTION increment_likes(media_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.media 
  SET likes = likes + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS PARA AUDITORIA
-- ========================================

-- Trigger para members
CREATE TRIGGER update_members_timestamp
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger para finances
CREATE TRIGGER update_finances_timestamp
BEFORE UPDATE ON public.finances
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger para events
CREATE TRIGGER update_events_timestamp
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger para documents
CREATE TRIGGER update_documents_timestamp
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger para media
CREATE TRIGGER update_media_timestamp
BEFORE UPDATE ON public.media
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========================================
-- DADOS INICIAIS (FAKE DATA)
-- ========================================

-- Inserir usuários de teste (OPCIONAL - descomente se quiser)
-- INSERT INTO public.users (email, full_name, role) VALUES
-- ('admin@igreja.com', 'Administrador', 'admin'),
-- ('pastor@igreja.com', 'Pastor João', 'pastor'),
-- ('secretaria@igreja.com', 'Secretária Maria', 'secretaria');

-- FIM DO SCRIPT
-- ========================================
-- Copie todo este conteúdo para SQL Editor do Supabase Dashboard
-- Settings → SQL Editor → Novo query → Cole tudo → Execute
-- ========================================
