# Arquitetura: Hunter System

## Visao geral
App estatico de tarefas gamificado que le um database do Notion e exibe as tarefas como missoes de RPG (XP, nivel, streak). Todo o backend e um script Node rodando em GitHub Actions; nao ha servidor proprio, banco de dados ou API HTTP alem da API oficial do Notion.

## Stack
* **Frontend:** React 19 + TypeScript, build com Vite 7, CSS Modules por componente.
* **Lint:** ESLint 9 com typescript-eslint e plugins de React Hooks/Refresh.
* **"Backend":** script Node (`scripts/sync-notion.mjs`), sem framework, usando `fetch` nativo contra a API REST do Notion (`https://api.notion.com/v1`, versao `2022-06-28`).
* **Persistencia:** nenhum banco. Estado persistido entre execucoes via arquivo `public/data/stats.json` versionado no proprio repositorio Git.
* **Infra:** GitHub Actions (cron a cada 15 minutos + deploy on push) e GitHub Pages para hospedagem estatica.
* **Testes:** nenhuma suite configurada (sem Vitest, Jest ou Testing Library no `package.json`).

## Fluxo de dados
```
GitHub Actions (cron 15min)
        |
        v
scripts/sync-notion.mjs --> Notion API (busca tarefas)
        |
        v
public/data/tasks.json + stats.json  (commitados de volta no repo)
        |
        v
GitHub Actions (deploy.yml, push na main)
        |
        v
GitHub Pages (build estatico do Vite)
        |
        v
Frontend React le tasks.json via fetch (useTaskData) e renderiza
```

Sem esse par de workflows, o app cai em modo demo (dados fixos de exemplo), tanto no lado do script (`SAMPLE_DATA`) quanto no lado do frontend (`src/data/sample.json`) - duas copias distintas de dados de exemplo, uma para cada fallback.

## Modulos e responsabilidades
* `scripts/sync-notion.mjs`: unico ponto de integracao externa. Busca, mapeia e transforma dados do Notion; calcula XP, nivel, streak e missoes diarias (regras completas em `.docs/specs/baseline-sincronizacao-notion.md` e `.docs/specs/baseline-gamificacao.md`).
* `src/hooks/useTaskData.ts`: unico ponto de acesso a dados no frontend; sem estado global.
* `src/components/`: componentes de apresentacao puros, recebem dados via props (regras em `.docs/specs/baseline-interface.md`).
* `src/types/task.ts`: contrato de dados compartilhado entre script de sync e frontend (nao ha geracao automatica de tipos; o contrato e mantido manualmente em paralelo nos dois lados).

## Decisoes aparentes
* Seguranca por design: o token do Notion so existe como GitHub Secret, nunca chega ao bundle do frontend nem ao JSON publico.
* Sem framework de estado (Redux, Zustand, Context): o app e pequeno o suficiente para um unico hook customizado.
* Duplicacao deliberada de logica de titulo/nivel entre script e componente como fallback de UI, mas sem sincronizacao formal entre as duas copias (ver divida em `baseline-gamificacao.md`).

## Fora da varredura
Nenhuma parte do codigo ficou fora da leitura nesta adocao; o projeto e pequeno (3 domains, ~30 arquivos de codigo).
