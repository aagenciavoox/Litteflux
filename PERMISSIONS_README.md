# Sistema de Permissões - Littê Flux CRM

## 📋 Visão Geral

O sistema de permissões foi implementado para fornecer controle granular sobre o que cada usuário pode fazer no sistema. Agora é possível definir permissões específicas por módulo e ação.

## ✅ O que foi implementado

### 1. **Estrutura de Banco de Dados**

#### Novas colunas na tabela `profiles`:
- `is_admin` (BOOLEAN): Indica se o usuário é administrador
- `permissions` (JSONB): Armazena permissões granulares

#### Exemplo de estrutura de permissões:
```json
{
  "campaigns": {
    "view": true,
    "edit": true,
    "create": true,
    "delete": false
  },
  "users": {
    "view": true,
    "edit": false,
    "create": false,
    "delete": false
  }
}
```

### 2. **Módulos Disponíveis**

- `dashboard` - Dashboard principal
- `pipeline` - Pipeline de vendas
- `campaigns` - Campanhas
- `financial` - Financeiro
- `influencers` - Assessorados/Influenciadores
- `users` - Gerenciamento de usuários
- `settings` - Configurações do sistema
- `reports` - Relatórios
- `audit_logs` - Logs de auditoria
- `system_notes` - Notas do sistema

### 3. **Ações Disponíveis**

Para cada módulo, existem 4 ações possíveis:
- `view` - Visualizar
- `edit` - Editar
- `create` - Criar
- `delete` - Deletar

### 4. **Funções RPC do Supabase**

#### `check_user_permission(p_user_id, p_module, p_action)`
Verifica se um usuário tem uma permissão específica.

```typescript
const hasPermission = await supabase.rpc('check_user_permission', {
  p_user_id: userId,
  p_module: 'campaigns',
  p_action: 'edit'
});
```

#### `get_user_profile_with_permissions(p_user_id)`
Retorna o perfil completo do usuário com todas as permissões.

```typescript
const { data } = await supabase.rpc('get_user_profile_with_permissions', {
  p_user_id: userId
});
```

#### `update_user_permissions(p_user_id, p_permissions)`
Atualiza as permissões de um usuário (somente admin).

```typescript
await supabase.rpc('update_user_permissions', {
  p_user_id: userId,
  p_permissions: {
    campaigns: { view: true, edit: true, create: false, delete: false }
  }
});
```

#### `promote_to_admin(p_user_id)`
Promove um usuário a administrador com todas as permissões.

```typescript
await supabase.rpc('promote_to_admin', {
  p_user_id: userId
});
```

## 🚀 Como Usar no Frontend

### 1. **Usando o Hook `usePermissions`**

```typescript
import { usePermissions } from '../hooks/usePermissions';

function CampaignPage() {
  const { user } = useAuth();
  const { hasPermission, isAdmin, loading } = usePermissions(user?.id);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Mostrar lista apenas se tiver permissão de visualizar */}
      {hasPermission('campaigns', 'view') && (
        <CampaignList />
      )}

      {/* Mostrar botão de criar apenas se tiver permissão */}
      {hasPermission('campaigns', 'create') && (
        <button onClick={handleCreate}>Nova Campanha</button>
      )}

      {/* Mostrar painel admin apenas para administradores */}
      {isAdmin && (
        <AdminPanel />
      )}
    </div>
  );
}
```

### 2. **Usando o Serviço Diretamente**

```typescript
import { auth } from '../services/supabase';

// Verificar permissão
const canEdit = await auth.checkPermission(userId, 'campaigns', 'edit');

// Obter perfil com permissões
const profile = await auth.getProfileWithPermissions(userId);

// Atualizar permissões (somente admin)
await auth.updateUserPermissions(userId, {
  campaigns: { view: true, edit: true, create: true, delete: false }
});

// Promover a admin
await auth.promoteToAdmin(userId);
```

## 🔐 Regras de Segurança

1. **Administradores** (`is_admin = true`):
   - Têm TODAS as permissões automaticamente
   - Podem gerenciar permissões de outros usuários
   - Podem promover outros usuários a admin

2. **Usuários Normais**:
   - Têm apenas as permissões definidas no campo `permissions`
   - Não podem alterar suas próprias permissões
   - Não podem promover outros usuários

3. **Sincronização Automática**:
   - Quando um usuário tem `role = 'ADMINISTRADOR'`, o campo `is_admin` é automaticamente definido como `true`
   - Um trigger garante essa sincronização em todas as inserções e atualizações

## 📊 Usuário Admin Configurado

O usuário `contato@litteassessoria.com` está configurado como administrador com:

- ✅ `role`: ADMINISTRADOR
- ✅ `status`: APROVADO
- ✅ `is_admin`: true
- ✅ **Todas as permissões ativas** em todos os módulos

### Verificar permissões do admin:

```sql
SELECT 
  email,
  role,
  status,
  is_admin,
  jsonb_pretty(permissions) as permissions
FROM profiles
WHERE email = 'contato@litteassessoria.com';
```

## 🛠️ Exemplos de Uso Avançado

### Verificar múltiplas permissões:

```typescript
const { hasPermission } = usePermissions(userId);

const canManageCampaigns = 
  hasPermission('campaigns', 'view') &&
  hasPermission('campaigns', 'edit') &&
  hasPermission('campaigns', 'create');
```

### Obter todas as permissões de um módulo:

```typescript
const { getModulePermissions } = usePermissions(userId);

const campaignPerms = getModulePermissions('campaigns');
// { view: true, edit: true, create: false, delete: false }
```

### Verificar se tem alguma permissão em um módulo:

```typescript
const { hasAnyPermission } = usePermissions(userId);

if (hasAnyPermission('campaigns')) {
  // Usuário tem pelo menos uma permissão em campanhas
}
```

## 📝 Notas Importantes

1. **Performance**: As permissões são carregadas uma vez e armazenadas em cache no hook
2. **Segurança**: Sempre valide permissões no backend também (RLS policies)
3. **Administradores**: Sempre têm todas as permissões, independente do campo `permissions`
4. **Atualização**: Ao atualizar permissões, o campo `updated_at` é automaticamente atualizado

## 🔄 Migrações Aplicadas

1. `add_admin_permissions_to_profiles` - Adiciona colunas is_admin e permissions
2. `create_permission_check_functions` - Cria funções RPC para gerenciamento de permissões

## 📚 Arquivos Relacionados

- `services/supabase.ts` - Funções de integração com Supabase
- `hooks/usePermissions.ts` - Hook personalizado para verificação de permissões
- `types.ts` - Interface UserProfile atualizada
- `database.types.ts` - Tipos TypeScript gerados do Supabase
- `PERMISSIONS_SUMMARY.sql` - Resumo SQL das alterações

## ✨ Próximos Passos

1. Implementar UI para gerenciamento de permissões no painel admin
2. Adicionar logs de auditoria para mudanças de permissões
3. Criar templates de permissões para diferentes tipos de usuários
4. Implementar permissões em nível de linha (RLS) no Supabase

---

**Última atualização**: 2026-01-12
**Status**: ✅ Totalmente funcional
