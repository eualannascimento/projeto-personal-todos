# Hunter System

Sistema de Missoes - App de tarefas gamificado inspirado em Solo Leveling.

Transforma suas tarefas do Notion em missoes de um RPG, com sistema de XP, niveis e recompensas.

## Funcionalidades

- Sincronizacao automatica com Notion (a cada 15 minutos)
- Visual inspirado em Solo Leveling
- Sistema de XP e niveis
- Streaks diarios
- Missoes diarias com metas
- Interface responsiva

## Seguranca

- O token do Notion fica **apenas** no GitHub Secrets
- Nunca e exposto no codigo ou no frontend
- O app le apenas um JSON estatico gerado pelo GitHub Actions

---

## Setup

### 1. Criar Integration no Notion

1. Acesse [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clique em **"+ New integration"**
3. De um nome (ex: "Hunter System")
4. Selecione o workspace
5. Clique em **"Submit"**
6. Copie o **"Internal Integration Secret"** (comeca com `secret_`)

### 2. Configurar Database no Notion

1. Crie um database no Notion chamado "Tarefas" (ou use um existente)
2. O database deve ter as seguintes propriedades:

| Propriedade | Tipo | Valores |
|-------------|------|---------|
| Name/Nome/Titulo | Title | - |
| Status | Select | "A fazer", "Em progresso", "Concluido" |
| Prioridade/Priority | Select | "Baixa", "Media", "Alta", "Urgente" |
| Tags (opcional) | Multi-select | Qualquer valor |
| Data (opcional) | Date | - |
| Descricao (opcional) | Text | - |

3. **Conecte a Integration ao database:**
   - Abra o database
   - Clique nos `...` no canto superior direito
   - Clique em **"Connect to"** → Selecione sua integration

4. **Copie o Database ID:**
   - Na URL do database: `notion.so/workspace/DATABASE_ID?v=...`
   - Copie apenas o `DATABASE_ID` (32 caracteres)

### 3. Configurar GitHub Secrets

No seu repositorio GitHub:

1. Va em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **"New repository secret"**
3. Adicione dois secrets:

| Nome | Valor |
|------|-------|
| `NOTION_TOKEN` | Seu Integration Secret (`secret_...`) |
| `NOTION_DATABASE_ID` | ID do database (32 caracteres) |

### 4. Ativar GitHub Pages

1. Va em **Settings** → **Pages**
2. Em **Source**, selecione **"GitHub Actions"**
3. Salve

### 5. Executar Primeira Sincronizacao

1. Va em **Actions** → **Sync Notion**
2. Clique em **"Run workflow"**
3. Aguarde a execucao

Pronto! Seu app estara disponivel em:
```
https://SEU_USUARIO.github.io/NOME_DO_REPO/
```

---

## Desenvolvimento Local

```bash
# Instalar dependencias
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para producao
npm run build

# Testar sync (requer variaveis de ambiente)
NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=xxx npm run sync
```

## Estrutura do Projeto

```
├── .github/workflows/
│   ├── sync-notion.yml    # Sync automatico com Notion
│   └── deploy.yml         # Deploy para GitHub Pages
├── public/
│   └── data/
│       └── tasks.json     # Dados gerados (pelo sync)
├── scripts/
│   └── sync-notion.mjs    # Script de sincronizacao
├── src/
│   ├── components/        # Componentes React
│   ├── hooks/             # Hooks customizados
│   ├── types/             # TypeScript types
│   └── App.tsx            # Componente principal
└── README.md
```

## Como Funciona

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  GitHub Action   │────▶│   Notion API     │────▶│   tasks.json     │
│  (a cada 15min)  │     │   (seus dados)   │     │   (publico)      │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │                  │
                                                  │   GitHub Pages   │
                                                  │   (seu app)      │
                                                  │                  │
                                                  └──────────────────┘
```

1. **GitHub Action** roda a cada 15 minutos
2. Busca tarefas do **Notion API** usando token seguro
3. Gera **tasks.json** com dados publicos
4. **GitHub Pages** serve o app que le o JSON

## Licenca

MIT
