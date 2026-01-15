-- =====================================================
-- LITTÊ FLUX - SETUP COMPLETO DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR TABELA PROFILES (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'CONVIDADO',
    status TEXT DEFAULT 'APROVADO',
    is_admin BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADICIONAR COLUNAS SE NÃO EXISTIREM
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'permissions') THEN
        ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
        ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'APROVADO';
    END IF;
END $$;

-- 3. HABILITAR RLS NA TABELA PROFILES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER POLICIES ANTIGAS (para evitar conflitos)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 5. CRIAR POLICIES CORRETAS
-- =====================================================
-- Qualquer usuário autenticado pode ver seu próprio perfil
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT TO authenticated
    USING (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR')
    );

-- Qualquer usuário autenticado pode inserir seu próprio perfil
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Qualquer usuário autenticado pode atualizar seu próprio perfil
-- Admins podem atualizar qualquer perfil
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = id
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR')
    );

-- 6. CRIAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_name TEXT;
    pre_approved RECORD;
    new_role TEXT := 'CONVIDADO';
    new_status TEXT := 'APROVADO';
    new_is_admin BOOLEAN := FALSE;
BEGIN
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1));

    -- Verificar se o email está pré-aprovado
    SELECT * INTO pre_approved FROM pre_approved_emails WHERE email = user_email LIMIT 1;

    IF FOUND THEN
        new_role := pre_approved.role;
        new_status := 'APROVADO';
        IF new_role = 'ADMINISTRADOR' THEN
            new_is_admin := TRUE;
        END IF;
    END IF;

    -- Criar o perfil
    INSERT INTO public.profiles (id, email, full_name, role, status, is_admin, permissions, created_at, updated_at)
    VALUES (
        NEW.id,
        user_email,
        user_name,
        new_role,
        new_status,
        new_is_admin,
        CASE WHEN new_is_admin THEN
            '{"dashboard":{"view":true,"edit":true,"create":true,"delete":true},"pipeline":{"view":true,"edit":true,"create":true,"delete":true},"campaigns":{"view":true,"edit":true,"create":true,"delete":true},"financial":{"view":true,"edit":true,"create":true,"delete":true},"influencers":{"view":true,"edit":true,"create":true,"delete":true},"users":{"view":true,"edit":true,"create":true,"delete":true},"settings":{"view":true,"edit":true,"create":true,"delete":true},"reports":{"view":true,"edit":true,"create":true,"delete":true},"audit_logs":{"view":true,"edit":true,"create":true,"delete":true},"system_notes":{"view":true,"edit":true,"create":true,"delete":true}}'::JSONB
        ELSE '{}'::JSONB END,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR TRIGGER PARA NOVO USUÁRIO
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. CRIAR FUNÇÃO get_user_profile (usada pelo código)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_profile(target_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'role', p.role,
        'status', p.status,
        'is_admin', p.is_admin,
        'permissions', p.permissions,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO result
    FROM profiles p
    WHERE p.id = target_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRIAR FUNÇÃO get_user_profile_with_permissions
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_profile_with_permissions(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT,
    status TEXT,
    is_admin BOOLEAN,
    permissions JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        p.role,
        p.status,
        p.is_admin,
        p.permissions,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CRIAR FUNÇÃO check_user_permission
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_user_permission(
    p_user_id UUID,
    p_module TEXT,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile RECORD;
BEGIN
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Admins têm todas as permissões
    IF user_profile.is_admin = TRUE OR user_profile.role = 'ADMINISTRADOR' THEN
        RETURN TRUE;
    END IF;

    -- Verificar permissão específica
    RETURN COALESCE(
        (user_profile.permissions -> p_module ->> p_action)::BOOLEAN,
        FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CRIAR FUNÇÃO update_user_permissions
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_user_permissions(
    p_user_id UUID,
    p_permissions JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    caller_profile RECORD;
BEGIN
    -- Verificar se o caller é admin
    SELECT * INTO caller_profile FROM profiles WHERE id = auth.uid();

    IF NOT FOUND OR (caller_profile.is_admin != TRUE AND caller_profile.role != 'ADMINISTRADOR') THEN
        RAISE EXCEPTION 'Apenas administradores podem alterar permissões';
    END IF;

    UPDATE profiles
    SET permissions = p_permissions, updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CRIAR FUNÇÃO promote_to_admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    caller_profile RECORD;
    full_permissions JSONB := '{"dashboard":{"view":true,"edit":true,"create":true,"delete":true},"pipeline":{"view":true,"edit":true,"create":true,"delete":true},"campaigns":{"view":true,"edit":true,"create":true,"delete":true},"financial":{"view":true,"edit":true,"create":true,"delete":true},"influencers":{"view":true,"edit":true,"create":true,"delete":true},"users":{"view":true,"edit":true,"create":true,"delete":true},"settings":{"view":true,"edit":true,"create":true,"delete":true},"reports":{"view":true,"edit":true,"create":true,"delete":true},"audit_logs":{"view":true,"edit":true,"create":true,"delete":true},"system_notes":{"view":true,"edit":true,"create":true,"delete":true}}';
BEGIN
    -- Verificar se o caller é admin
    SELECT * INTO caller_profile FROM profiles WHERE id = auth.uid();

    IF NOT FOUND OR (caller_profile.is_admin != TRUE AND caller_profile.role != 'ADMINISTRADOR') THEN
        RAISE EXCEPTION 'Apenas administradores podem promover usuários';
    END IF;

    UPDATE profiles
    SET
        role = 'ADMINISTRADOR',
        status = 'APROVADO',
        is_admin = TRUE,
        permissions = full_permissions,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CRIAR TABELA pre_approved_emails (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS pre_approved_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'CONVIDADO',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pre_approved_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pre_approved_emails_policy" ON pre_approved_emails;
CREATE POLICY "pre_approved_emails_policy" ON pre_approved_emails
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR'));

-- 14. CRIAR TABELA settings (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_policy" ON settings;
DROP POLICY IF EXISTS "settings_update_policy" ON settings;
CREATE POLICY "settings_select_policy" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_update_policy" ON settings FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR'));

-- 15. CRIAR TABELA notifications (se não existir)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    campaign_id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    event_date TIMESTAMPTZ,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_policy" ON notifications;
CREATE POLICY "notifications_policy" ON notifications FOR ALL TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR'));

-- 16. ATUALIZAR POLICIES DAS OUTRAS TABELAS
-- =====================================================

-- LEADS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_policy" ON leads;
CREATE POLICY "leads_policy" ON leads FOR ALL TO authenticated USING (true);

-- CAMPAIGNS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_policy" ON campaigns;
CREATE POLICY "campaigns_policy" ON campaigns FOR ALL TO authenticated USING (true);

-- INFLUENCERS
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "influencers_policy" ON influencers;
CREATE POLICY "influencers_policy" ON influencers FOR ALL TO authenticated USING (true);

-- TEMPLATES
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "templates_policy" ON templates;
CREATE POLICY "templates_policy" ON templates FOR ALL TO authenticated USING (true);

-- 17. CORRIGIR POLICIES DE AUDIT_LOGS E SYSTEM_NOTES
-- =====================================================
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Enable view for admins" ON audit_logs;
DROP POLICY IF EXISTS "Admins full access to notes" ON system_notes;

CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR'));

CREATE POLICY "system_notes_policy" ON system_notes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMINISTRADOR'));

-- 18. CRIAR PRIMEIRO ADMIN (se não existir)
-- Substitua 'seu-email@exemplo.com' pelo email do admin
-- =====================================================
-- INSERT INTO pre_approved_emails (email, role)
-- VALUES ('seu-email@exemplo.com', 'ADMINISTRADOR')
-- ON CONFLICT (email) DO UPDATE SET role = 'ADMINISTRADOR';

-- 19. FUNÇÃO PARA SETUP DE ADMIN MANUAL
-- Execute após criar sua conta para se tornar admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.make_first_admin(admin_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Verificar se já existe admin
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'ADMINISTRADOR';

    -- Se não existir admin, permitir que qualquer um se torne o primeiro
    IF admin_count = 0 THEN
        UPDATE profiles
        SET
            role = 'ADMINISTRADOR',
            status = 'APROVADO',
            is_admin = TRUE,
            permissions = '{"dashboard":{"view":true,"edit":true,"create":true,"delete":true},"pipeline":{"view":true,"edit":true,"create":true,"delete":true},"campaigns":{"view":true,"edit":true,"create":true,"delete":true},"financial":{"view":true,"edit":true,"create":true,"delete":true},"influencers":{"view":true,"edit":true,"create":true,"delete":true},"users":{"view":true,"edit":true,"create":true,"delete":true},"settings":{"view":true,"edit":true,"create":true,"delete":true},"reports":{"view":true,"edit":true,"create":true,"delete":true},"audit_logs":{"view":true,"edit":true,"create":true,"delete":true},"system_notes":{"view":true,"edit":true,"create":true,"delete":true}}'::JSONB,
            updated_at = NOW()
        WHERE email = admin_email;

        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Já existe um administrador no sistema';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- 1. Execute todo este script no SQL Editor do Supabase
-- 2. Crie uma conta no sistema (signup)
-- 3. Execute: SELECT make_first_admin('seu-email@exemplo.com');
-- 4. Faça logout e login novamente
-- =====================================================

SELECT 'Setup completo! Execute: SELECT make_first_admin(''seu-email@exemplo.com''); para se tornar admin.' as instrucao;
