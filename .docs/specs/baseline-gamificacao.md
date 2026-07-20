# Gamificacao (XP, nivel, streak, missoes diarias)

**Status:** Concluido
**Data:** 2026-07-20

## 1. Resumo e Objetivo
Transforma a conclusao de tarefas do Notion em progresso de RPG: XP por prioridade, niveis com titulos tematicos, streak diario e missoes diarias calculadas a cada sincronizacao. Toda a logica roda no script de sync, nao no cliente.

## 2. User Stories (Requisitos Funcionais)
* **US01:** Como usuario, quero ganhar XP proporcional a prioridade da tarefa que completo, para que tarefas mais importantes valham mais.
* **US02:** Como usuario, quero subir de nivel e ganhar titulos (Novato ate Monarca) conforme acumulo XP.
* **US03:** Como usuario, quero manter um streak de dias consecutivos completando tarefas, e ver meu recorde.
* **US04:** Como usuario, quero missoes diarias com metas de quantidade de tarefas completadas, para ter objetivos de curto prazo.

## 3. Regras de Negocio e Casos de Falha (Edge Cases)
* **Regra 01:** XP por tarefa e fixo por prioridade: baixa = 10, media = 25, alta = 50, urgente = 100 (`calculateXp`, `scripts/sync-notion.mjs:269-278`).
* **Regra 02:** `totalXpEarned` e a soma do `xpReward` de todas as tarefas com status `completed` (`calculatePlayerStats`, `scripts/sync-notion.mjs:462-463`), recalculada do zero a cada sync, nao incremental.
* **Regra 03:** O nivel e derivado de `totalXpEarned` por um custo crescente: nivel 1 exige 100 XP, nivel 2 exige mais 200 XP (100 * nivel), nivel 3 mais 300 XP, e assim por diante; a funcao acumula `xpNeeded` ate ultrapassar o XP total (`calculateLevel`, `scripts/sync-notion.mjs:394-410`).
* **Regra 04:** O titulo do jogador e definido por faixas de nivel: >=50 Monarca, >=40 Lenda, >=30 Mestre, >=25 Elite, >=20 Veterano, >=15 Guerreiro, >=10 Cacador, >=5 Aprendiz, abaixo disso Novato (`getTitle`, `scripts/sync-notion.mjs:413-423`).
* **Regra 05:** Streak considera apenas tarefas completadas no dia corrente (`tasksCompletedToday`, calculado a partir de `completedAt` comecando com a data de hoje). Se nenhuma tarefa foi completada hoje, o streak atual e mantido sem alteracao (nao zera automaticamente so por inatividade no dia da execucao) (`calculateStreak`, `scripts/sync-notion.mjs:426-458`).
* **Regra 06:** Se a ultima data de conclusao registrada for ontem (diff de 1 dia), o streak incrementa; se o gap for maior que 1 dia, o streak reinicia em 1; se for o mesmo dia, mantem o valor atual (`calculateStreak`, `scripts/sync-notion.mjs:439-450`).
* **Regra 07:** `longestStreak` e o maior valor entre o streak salvo anteriormente e o streak atual calculado, nunca diminui (`calculatePlayerStats`, `scripts/sync-notion.mjs:476`).
* **Regra 08:** As 3 missoes diarias sao fixas e recalculadas a cada sync, sem persistencia de progresso proprio: "Completar 3 tarefas" (recompensa 50 XP), "Completar 1 tarefa prioritaria" (alta ou urgente, recompensa 30 XP), "Completar 5 tarefas" (recompensa 100 XP), todas medindo apenas conclusoes do dia corrente (`generateDailyQuests`, `scripts/sync-notion.mjs:492-532`). [INCERTO: a recompensa de XP das missoes diarias e apenas exibida na UI ou e somada ao XP total do jogador em algum momento? O codigo atual nao soma `dailyQuests[].xpReward` a `totalXpEarned`. Usuario nao lembra a intencao original; decisao adiada para quando essa area for tocada por uma feature nova.]
* **Falha 01:** Sem stats anteriores (primeira execucao), o jogador comeca no nivel 1 com titulo "Novato" e streak 0 (`loadPreviousStats`, `scripts/sync-notion.mjs:380-390`).

## 4. Estrutura de Dados e Componentes
* **Modelos:** `PlayerStats`, `DailyQuest` (`src/types/task.ts`).
* **Arquivos:** logica de calculo em `scripts/sync-notion.mjs` (`calculateXp`, `calculateLevel`, `getTitle`, `calculateStreak`, `calculatePlayerStats`, `generateDailyQuests`); persistencia parcial em `public/data/stats.json`.
* **Duplicacao conhecida:** `getTitle` existe tambem no frontend em `src/components/StatusPanel/StatusPanel.tsx:23-29`, usado apenas como fallback se `stats.title` vier vazio do JSON.

## 5. Criterios de Aceite (verificaveis por teste)
* [ ] CA01: Dada uma tarefa de prioridade `urgent` completada, quando o XP e calculado, entao o valor e 100.
* [ ] CA02: Dado um jogador com 0 XP total, quando o nivel e calculado, entao o nivel e 1 e faltam 100 XP para o proximo.
* [ ] CA03: Dado que o jogador completou tarefas ontem e nao completou nenhuma hoje, quando o streak e recalculado, entao o `currentStreak` permanece igual ao salvo anteriormente.
* [ ] CA04: Dado um gap de 2 dias sem tarefas completadas, quando uma tarefa e completada hoje, entao `currentStreak` reinicia em 1.

## 6. Fora de Escopo
* Recompensas ou penalidades alem de XP (o aviso "Falhar em completar missoes diarias traz consequencias" exibido em `DailyQuests.tsx:63` e apenas texto de ambientacao; nenhuma penalidade e aplicada no codigo).
* Configuracao de metas de missoes diarias pelo usuario; os 3 alvos sao fixos no codigo.

## 7. Dividas e riscos observados
* A regra de XP das missoes diarias (`dailyQuests[].xpReward`) nao esta conectada a `totalXpEarned`: o jogador ve "+50 XP" na missao mas esse valor nunca e somado ao total, o que pode ser um bug ou uma escolha deliberada de UI ainda sem confirmacao.
* `calculateStreak` usa `new Date()` no fuso do runner (GitHub Actions, geralmente UTC), enquanto `lastSync` exibido ao usuario usa `America/Sao_Paulo`; uma tarefa completada as 21h-23h BRT pode ser contada no dia seguinte para fins de streak.
* Sem testes automatizados cobrindo as regras de progressao de nivel, streak ou geracao de missoes diarias.
