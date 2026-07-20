# Sincronizacao com Notion

**Status:** Concluido
**Data:** 2026-07-20

## 1. Resumo e Objetivo
Busca tarefas de um database do Notion via API e gera um JSON estatico (`public/data/tasks.json`) consumido pelo frontend. Roda em GitHub Actions a cada 15 minutos, sem expor credenciais no cliente.

## 2. User Stories (Requisitos Funcionais)
* **US01:** Como usuario do app, quero que minhas tarefas do Notion aparecam automaticamente no Hunter System, sem sincronizacao manual.
* **US02:** Como usuario sem Notion configurado, quero ver dados de exemplo para entender o app antes de configurar minha conta.
* **US03:** Como mantenedor, quero que o token do Notion nunca seja exposto no frontend ou no JSON publico.

## 3. Regras de Negocio e Casos de Falha (Edge Cases)
* **Regra 01:** O modo demo ativa quando `NOTION_TOKEN` ou `NOTION_DATABASE_ID` nao estao definidos (`main`, `scripts/sync-notion.mjs:607-615`).
* **Regra 02:** Se a sincronizacao com o Notion falhar (erro de API), o script cai para o modo demo como fallback em vez de interromper o build (`main`, `scripts/sync-notion.mjs:617-624`).
* **Regra 03:** O status do Notion e mapeado por uma tabela fixa de strings em PT-BR e EN ("A fazer"/"To Do"/"Pendente" -> `pending`; "Em progresso"/"In Progress"/"Fazendo" -> `in_progress`; "Concluido"/"Done"/"Feito"/"Completo" -> `completed`); qualquer valor nao mapeado cai em `pending` (`mapStatus`, `scripts/sync-notion.mjs:233-248`).
* **Regra 04:** A prioridade e mapeada por tabela equivalente ("Baixa"/"Low" -> `low`, "Media"/"Medium"/"Normal" -> `medium`, "Alta"/"High" -> `high`, "Urgente"/"Urgent"/"Critica" -> `urgent`); valor nao mapeado cai em `medium` (`mapPriority`, `scripts/sync-notion.mjs:251-266`).
* **Regra 05:** O titulo da tarefa e extraido tentando, em ordem, as propriedades `Name`, `Nome`, `Title`, `Titulo`, `Tarefa`; se nenhuma existir, usa "Sem titulo" (`transformTask`, `scripts/sync-notion.mjs:317-323`).
* **Regra 06:** `completedAt` so e preenchido quando o status mapeado e `completed`, usando `page.last_edited_time` do Notion como data de conclusao (`transformTask`, `scripts/sync-notion.mjs:361`). [INCERTO: se a tarefa for reaberta e fechada de novo no Notion, `last_edited_time` muda para a data da ultima edicao qualquer, nao necessariamente a da conclusao. Usuario nao soube confirmar se isso e um problema real no uso atual; decisao adiada para quando o fluxo de reabertura de tarefas for tocado por uma feature nova.]
* **Regra 07:** As tarefas sao ordenadas na propria query do Notion por Status ascendente e Prioridade descendente (`fetchTasks`, `scripts/sync-notion.mjs:218-227`).
* **Limite 01:** O JSON gerado (`tasks.json`) e sempre publico no GitHub Pages; nenhum campo sensivel deve ser adicionado a `transformTask`.
* **Falha 01:** Se `loadPreviousStats` nao encontrar `stats.json` anterior, comeca do zero (level 1, XP 0, streak 0) (`loadPreviousStats`, `scripts/sync-notion.mjs:369-391`).

## 4. Estrutura de Dados e Componentes
* **Modelos:** `Task`, `SyncData` (`src/types/task.ts`).
* **Arquivos gerados:** `public/data/tasks.json` (dados completos), `public/data/stats.json` (stats do jogador, usado como estado persistido entre execucoes).
* **Arquitetura:** `scripts/sync-notion.mjs` roda via `.github/workflows/sync-notion.yml` (cron `*/15 * * * *`, tambem dispara em push na `main` exceto mudancas em `public/data/**`), commita o JSON gerado de volta no repositorio.

## 5. Criterios de Aceite (verificaveis por teste)
* [ ] CA01: Dado `NOTION_TOKEN` e `NOTION_DATABASE_ID` ausentes, quando o script roda, entao gera `tasks.json` com os 10 registros de exemplo fixos em `SAMPLE_DATA`.
* [ ] CA02: Dado um status do Notion fora da tabela de mapeamento, quando a tarefa e transformada, entao o status resultante e `pending`.
* [ ] CA03: Dada uma falha na chamada a API do Notion, quando o script roda, entao ele nao lanca excecao e gera dados de exemplo como fallback.

## 6. Fora de Escopo
* Escrita de dados de volta no Notion (o fluxo e somente leitura).
* Autenticacao de usuario final; o app e publico e mostra os dados de um unico workspace Notion configurado via secrets.

## 7. Dividas e riscos observados
* Nao ha testes automatizados para as funcoes de mapeamento e transformacao (`mapStatus`, `mapPriority`, `transformTask`, `calculateLevel`), apesar de concentrarem toda a logica de negocio do script.
* `calculateLevel` e `getTitle` (`scripts/sync-notion.mjs:394-423`) duplicam a mesma logica presente em `src/components/StatusPanel/StatusPanel.tsx:11-29`, com fontes de verdade distintas: o script escreve o titulo pronto no JSON, mas o componente recalcula por conta propria se `stats.title` vier vazio. Divergencia futura entre as duas tabelas de titulos passaria despercebida.
* O calculo de streak (`calculateStreak`, `scripts/sync-notion.mjs:426-458`) depende do fuso horario do runner do GitHub Actions para `new Date().toISOString().split('T')[0]`, e nao do fuso `America/Sao_Paulo` usado em `lastSync`; tarefas concluidas perto da meia-noite podem cair no dia errado.
* Sem lock ou verificacao de concorrencia entre a execucao agendada (cron) e a execucao disparada por push; ambas podem rodar em paralelo e gerar commits conflitantes.
