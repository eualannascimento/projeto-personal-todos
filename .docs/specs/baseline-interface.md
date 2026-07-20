# Interface (frontend React)

**Status:** Concluido
**Data:** 2026-07-20

## 1. Resumo e Objetivo
App React que consome `public/data/tasks.json` e exibe as tarefas do Notion como missoes de RPG, com painel de status do jogador, barra de XP e missoes diarias, seguindo visual inspirado em Solo Leveling.

## 2. User Stories (Requisitos Funcionais)
* **US01:** Como usuario, quero ver minhas tarefas organizadas por status (em progresso primeiro, depois pendentes, depois completas).
* **US02:** Como usuario, quero atualizar os dados manualmente sem esperar o proximo sync automatico.
* **US03:** Como usuario sem dados reais configurados, quero um aviso claro de que estou vendo dados de exemplo.
* **US04:** Como usuario, quero abrir a tarefa original no Notion a partir do card.

## 3. Regras de Negocio e Casos de Falha (Edge Cases)
* **Regra 01:** `useTaskData` busca `./data/tasks.json` com `cache: 'no-store'`; se a resposta falhar (HTTP nao-ok) ou o array `tasks` vier vazio/ausente, cai para `src/data/sample.json` e marca `isSample = true` (`useTaskData`, `src/hooks/useTaskData.ts:12-37`).
* **Regra 02:** A lista de tarefas e ordenada agrupando por status na ordem fixa: em progresso, depois pendentes, depois completas, sem ordenacao secundaria dentro de cada grupo (`QuestList`, `src/components/QuestList/QuestList.tsx:19-23`).
* **Regra 03:** O resumo no topo da lista mostra total de tarefas, quantidade em progresso, quantidade completa e XP acumulado sobre XP total possivel (`completedXp`/`totalXp`) (`QuestList`, `src/components/QuestList/QuestList.tsx:25-58`).
* **Regra 04:** `ProgressBar` limita a porcentagem visual a no maximo 100%, mesmo que `current` exceda `max` (`ProgressBar`, `src/components/ProgressBar/ProgressBar.tsx:22`).
* **Regra 05:** O titulo do jogador exibido usa `stats.title` vindo do JSON; se vazio, recalcula localmente por faixa de nivel (`StatusPanel`, `src/components/StatusPanel/StatusPanel.tsx:23-32`) [ver duvida de duplicacao em `baseline-gamificacao.md`].
* **Regra 06:** O banner de modo demo so aparece quando `isSample` e verdadeiro, entre o header e o conteudo principal (`App.tsx:43-51`).
* **Regra 07:** Enquanto `isLoading` e verdadeiro, a UI mostra apenas header e spinner; se `data` permanecer `null` apos o carregamento (falha total), mostra mensagem de erro pedindo para configurar a integracao com o Notion (`App.tsx:8-33`).
* **Falha 01:** O link "Abrir no Notion" em cada card usa `task.notionUrl` diretamente sem validacao de formato (`TaskCard.tsx:61-70`); assume que o dado vindo do sync sempre e uma URL valida do Notion.

## 4. Estrutura de Dados e Componentes
* **Hook:** `useTaskData` (`src/hooks/useTaskData.ts`) - unica fonte de dados do app, sem estado global (Context/Redux), apenas `useState` local em `App.tsx`.
* **Componentes:** `Header`, `Panel` (container visual com variantes `default`/`quest`/`status`/`reward`), `StatusPanel`, `ProgressBar` (variantes `hp`/`mp`/`xp`/`default`), `QuestList`, `TaskCard`, `DailyQuests`, `Button` (variantes `primary`/`secondary`/`success`/`danger`/`ghost`).
* **Estilo:** CSS Modules por componente (`*.module.css`) mais tema central em `src/styles/theme.ts` (cores, fontes, sombras, raios de borda) que hoje nao e importado por nenhum componente [INCERTO: `theme.ts` foi abandonado em favor dos CSS Modules, ou deveria estar sendo consumido em algum lugar? Usuario nao soube confirmar a intencao original; tratar como divida tecnica ate decisao futura.].
* **Roteamento:** nenhum; app de tela unica.

## 5. Criterios de Aceite (verificaveis por teste)
* [ ] CA01: Dado que `tasks.json` nao existe ou retorna 404, quando o app carrega, entao exibe os dados de `sample.json` e o banner de modo demo.
* [ ] CA02: Dadas tarefas com status `in_progress`, `pending` e `completed` misturadas, quando a lista e renderizada, entao a ordem e em_progresso -> pendente -> completa.
* [ ] CA03: Dado `current` maior que `max` em `ProgressBar`, quando renderizado, entao a barra preenche no maximo 100% da largura.

## 6. Fora de Escopo
* Edicao ou criacao de tarefas pela interface (o app e somente leitura; qualquer mudanca ocorre no Notion).
* Autenticacao ou multi-usuario; a interface e publica e mostra os dados de um unico workspace.
* Responsividade mobile detalhada [INCERTO: nao foi possivel confirmar cobertura de breakpoints so pela leitura do CSS; recomenda-se validacao visual manual].

## 7. Dividas e riscos observados
* `src/styles/theme.ts` define um design token central que nenhum componente importa; os CSS Modules parecem ter suas proprias cores hardcoded, criando duas fontes de verdade para a paleta visual.
* Nenhum teste de componente (Testing Library, etc.) esta configurado; toda validacao de UI e manual.
* `useTaskData` nao trata erro de parsing de JSON malformado separadamente de erro de rede; qualquer excecao no bloco `try` cai no mesmo fallback de dados de exemplo, dificultando diagnostico de qual falha ocorreu de fato.
