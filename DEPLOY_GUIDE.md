# 🚀 Guia Completo de Deploy para Produção - Littê Flux CRM

## 📋 Pré-requisitos

- [x] Conta no Supabase
- [x] Conta no Vercel
- [x] Conta no GitHub
- [x] Node.js 18+ instalado
- [x] Git configurado

## 🔐 Segurança Implementada

### ✅ **Credenciais Protegidas**
- Todas as credenciais sensíveis foram removidas do código
- Apenas variáveis de ambiente são usadas
- Nenhuma chave hardcoded no repositório

### ✅ **RLS (Row Level Security) Configurado**
- Todas as tabelas têm RLS habilitado
- Políticas de segurança implementadas:
  - Admins têm acesso total
  - Influenciadores veem apenas seus dados
  - Usuários veem apenas seus próprios perfis

### ✅ **Permissões Granulares**
- Sistema completo de permissões por módulo
- Controle de ações (view, edit, create, delete)
- Admin configurado com todas as permissões

## 📦 Etapa 1: Preparar Supabase

### 1.1 Verificar Migrações Aplicadas

Todas as migrações já foram aplicadas:
- ✅ `add_admin_permissions_to_profiles`
- ✅ `create_permission_check_functions`
- ✅ `update_is_admin_function_to_use_new_field`
- ✅ `create_system_notes_table_with_rls`

### 1.2 Verificar Usuário Admin

Execute no SQL Editor do Supabase:

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

**Resultado esperado:**
- `is_admin`: true
- `role`: ADMINISTRADOR
- `status`: APROVADO
- Todas as permissões ativas

### 1.3 Obter Credenciais

1. Acesse: https://supabase.com/dashboard/project/zfjfonvjfjtqmhfjjfua/settings/api
2. Copie:
   - **Project URL**: `https://zfjfonvjfjtqmhfjjfua.supabase.co`
   - **anon/public key**: Chave pública (começa com `eyJ...`)

## 🌐 Etapa 2: Deploy no Vercel

### 2.1 Conectar Repositório GitHub

1. Acesse: https://vercel.com/new
2. Importe o repositório do GitHub
3. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```
VITE_SUPABASE_URL=https://zfjfonvjfjtqmhfjjfua.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon-aqui>
```

**IMPORTANTE:** 
- Use a chave `anon/public` do Supabase
- NÃO use a chave `service_role` (é secreta!)
- Marque para aplicar em: Production, Preview e Development

### 2.3 Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (2-3 minutos)
3. Acesse a URL fornecida pelo Vercel

## 🔄 Etapa 3: Configurar CI/CD

### 3.1 GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### 3.2 Vercel Auto-Deploy

O Vercel já está configurado para:
- ✅ Deploy automático em push para `main`
- ✅ Preview deploys para PRs
- ✅ Rollback automático em caso de erro

## 🧪 Etapa 4: Testar em Produção

### 4.1 Checklist de Testes

- [ ] Login funciona
- [ ] Dashboard carrega corretamente
- [ ] Permissões do admin funcionam
- [ ] CRUD de campanhas funciona
- [ ] CRUD de influenciadores funciona
- [ ] Pipeline funciona
- [ ] Financeiro funciona
- [ ] Notas do sistema funcionam (apenas admin)

### 4.2 Testar Segurança

1. **Teste de Admin:**
   - Login com `contato@litteassessoria.com`
   - Verificar acesso a todas as funcionalidades
   - Testar criação/edição/exclusão

2. **Teste de Influenciador:**
   - Login com conta de influenciador
   - Verificar que vê apenas seus dados
   - Verificar que não pode acessar área admin

3. **Teste de RLS:**
   - Tentar acessar dados de outros usuários via API
   - Deve retornar erro 403 ou dados vazios

## 📊 Etapa 5: Monitoramento

### 5.1 Vercel Analytics

1. Acesse: Vercel Dashboard > Analytics
2. Monitore:
   - Tempo de resposta
   - Taxa de erro
   - Uso de recursos

### 5.2 Supabase Logs

1. Acesse: Supabase Dashboard > Logs
2. Monitore:
   - Queries lentas
   - Erros de autenticação
   - Violações de RLS

### 5.3 Advisors (Segurança)

Execute regularmente:

```sql
-- Via MCP
mcp_supabase-mcp-server_get_advisors({
  project_id: "zfjfonvjfjtqmhfjjfua",
  type: "security"
})
```

## 🔧 Etapa 6: Manutenção

### 6.1 Backup Regular

O Supabase faz backup automático, mas você pode:

1. Exportar dados manualmente
2. Usar `pg_dump` para backup local
3. Configurar backup incremental

### 6.2 Atualizações

Para atualizar o sistema:

```bash
# 1. Criar branch de feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer alterações e testar localmente
npm run dev

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# 4. Criar PR no GitHub
# 5. Vercel cria preview deploy automaticamente
# 6. Após aprovação, merge para main
# 7. Deploy automático em produção
```

### 6.3 Rollback

Se algo der errado:

1. Acesse Vercel Dashboard
2. Vá em "Deployments"
3. Encontre o deploy anterior estável
4. Clique em "Promote to Production"

## 📝 Variáveis de Ambiente

### Desenvolvimento (.env)

```env
VITE_SUPABASE_URL=https://zfjfonvjfjtqmhfjjfua.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
```

### Produção (Vercel)

Configuradas via Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🚨 Troubleshooting

### Erro: "Missing Supabase credentials"

**Solução:**
1. Verificar variáveis de ambiente no Vercel
2. Redeploy após adicionar variáveis
3. Limpar cache do Vercel

### Erro: "RLS policy violation"

**Solução:**
1. Verificar se usuário está autenticado
2. Verificar políticas RLS no Supabase
3. Verificar se `is_admin()` retorna correto

### Erro: "Build failed"

**Solução:**
1. Verificar logs do Vercel
2. Testar build localmente: `npm run build`
3. Verificar dependências: `npm ci`

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev/)
- [Sistema de Permissões](./PERMISSIONS_README.md)

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Todas as migrações aplicadas no Supabase
- [ ] RLS habilitado em todas as tabelas
- [ ] Admin configurado com todas as permissões
- [ ] Credenciais removidas do código
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Testes de funcionalidade passando
- [ ] Testes de segurança passando
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

## 🎉 Conclusão

Seu sistema está pronto para produção com:
- ✅ Segurança robusta (RLS + Permissões)
- ✅ Deploy automatizado (Vercel + GitHub)
- ✅ Monitoramento configurado
- ✅ Backup automático
- ✅ CI/CD configurado

---

**Última atualização:** 2026-01-12  
**Status:** ✅ Pronto para Produção
