-- =====================================================
-- RESUMO DAS ALTERAÇÕES DE PERMISSÕES
-- Data: 2026-01-12
-- Objetivo: Adicionar sistema completo de permissões
-- =====================================================

-- 1. NOVAS COLUNAS ADICIONADAS À TABELA PROFILES
-- =====================================================
-- - is_admin: BOOLEAN (indica se o usuário é administrador)
-- - permissions: JSONB (permissões granulares por módulo)

-- 2. ESTRUTURA DE PERMISSÕES
-- =====================================================
-- Cada módulo tem 4 ações possíveis:
-- - view: visualizar
-- - edit: editar
-- - create: criar
-- - delete: deletar

-- Módulos disponíveis:
-- - dashboard
-- - pipeline
-- - campaigns
-- - financial
-- - influencers
-- - users
-- - settings
-- - reports
-- - audit_logs
-- - system_notes

-- 3. FUNÇÕES RPC CRIADAS
-- =====================================================

-- check_user_permission(p_user_id, p_module, p_action)
-- Verifica se um usuário tem uma permissão específica
-- Retorna: BOOLEAN

-- get_user_profile_with_permissions(p_user_id)
-- Retorna o perfil completo do usuário com todas as permissões
-- Retorna: TABLE com todos os campos do perfil

-- update_user_permissions(p_user_id, p_permissions)
-- Atualiza as permissões de um usuário (somente admin)
-- Retorna: BOOLEAN

-- promote_to_admin(p_user_id)
-- Promove um usuário a administrador com todas as permissões
-- Retorna: BOOLEAN

-- 4. TRIGGER AUTOMÁTICO
-- =====================================================
-- sync_is_admin()
-- Sincroniza automaticamente is_admin com role
-- Quando role = 'ADMINISTRADOR', is_admin = true
-- Quando role != 'ADMINISTRADOR', is_admin = false

-- 5. USUÁRIO ADMIN CONFIGURADO
-- =====================================================
-- Email: contato@litteassessoria.com
-- Role: ADMINISTRADOR
-- Status: APROVADO
-- is_admin: true
-- Permissões: TODAS ATIVAS (view, edit, create, delete em todos os módulos)

-- 6. VERIFICAÇÃO DO USUÁRIO ADMIN
-- =====================================================
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.is_admin,
  jsonb_pretty(p.permissions) as permissions_formatted
FROM profiles p
WHERE p.email = 'contato@litteassessoria.com';

-- 7. EXEMPLO DE USO DAS FUNÇÕES RPC
-- =====================================================

-- Verificar se o usuário tem permissão para editar campanhas:
-- SELECT check_user_permission('user-id-here', 'campaigns', 'edit');

-- Obter perfil completo com permissões:
-- SELECT * FROM get_user_profile_with_permissions('user-id-here');

-- Atualizar permissões de um usuário (como admin):
-- SELECT update_user_permissions('user-id-here', '{"campaigns": {"view": true, "edit": false}}');

-- Promover usuário a admin:
-- SELECT promote_to_admin('user-id-here');

-- 8. INTEGRAÇÃO COM TYPESCRIPT
-- =====================================================
-- Funções adicionadas ao arquivo services/supabase.ts:
-- - auth.getProfileWithPermissions(userId)
-- - auth.checkPermission(userId, module, action)
-- - auth.updateUserPermissions(userId, permissions)
-- - auth.promoteToAdmin(userId)

-- Interface UserProfile atualizada em types.ts com:
-- - is_admin?: boolean
-- - permissions?: { [module: string]: { view?, edit?, create?, delete? } }

-- 9. ÍNDICES CRIADOS
-- =====================================================
-- idx_profiles_is_admin: índice em is_admin para melhor performance
-- idx_profiles_permissions: índice GIN em permissions para buscas em JSONB

-- =====================================================
-- FIM DO RESUMO
-- =====================================================
