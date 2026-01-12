# Guia de Deploy e Configuração

## Estrutura do Projeto
Este projeto está organizado da seguinte forma:
- **Raiz**: Scripts utilitários (`package.json`) para facilitar o uso local.
- **/Litteflux**: O código fonte principal da aplicação (Vite + React).

## Como rodar localmente
Na pasta raiz do projeto, você pode executar:

```bash
npm install      # Instala dependências (se necessário)
npm run install:app # Instala dependências da aplicação Litteflux
npm run dev      # Inicia o servidor local
npm run build    # Gera a versão de produção
```

## Configuração no Vercel
Ao importar este repositório no Vercel:

1. **Root Directory (Diretório Raiz)**: 
   - Deixe como `./` (padrão), pois este repositório já é a pasta do projeto.

2. **Environment Variables (Variáveis de Ambiente)**:
   Adicione as chaves do Supabase nas configurações do projeto no Vercel:
   - `VITE_SUPABASE_URL`: (Sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Sua chave Anon/Public)

   *Consulte o arquivo `Litteflux/.env.example` como referência.*

3. **Output Directory**:
   - O padrão `dist` deve funcionar automaticamente (o Vite usa `dist` por padrão).

## Configuração do Supabase
Certifique-se de que sua instância do Supabase tenha as tabelas criadas no `database.types.ts` e as Policies (RLS) corretas para permitir leitura/escrita conforme necessário.
