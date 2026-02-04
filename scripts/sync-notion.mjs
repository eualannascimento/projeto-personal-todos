/**
 * Script de sincronização com o Notion
 * Executado pelo GitHub Actions para buscar tarefas e gerar JSON
 *
 * COMPORTAMENTO:
 * - Se NOTION_TOKEN e NOTION_DATABASE_ID estão configurados → sincroniza com Notion
 * - Se não estão configurados → gera dados de exemplo (modo demo)
 *
 * SEGURANÇA:
 * - O NOTION_TOKEN é armazenado APENAS no GitHub Secrets
 * - Nunca é exposto no código ou no JSON gerado
 * - O JSON público contém apenas dados das tarefas
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuração
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'tasks.json');
const STATS_FILE = join(OUTPUT_DIR, 'stats.json');

// Dados de exemplo para modo demo
const SAMPLE_DATA = {
  tasks: [
    {
      id: 'sample-1',
      title: 'Estudar TypeScript avancado',
      description: 'Generics, utility types e decorators',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2025-01-15T09:00:00Z',
      tags: ['estudo', 'programacao'],
      notionUrl: 'https://notion.so',
      xpReward: 50
    },
    {
      id: 'sample-2',
      title: 'Treino na academia',
      description: 'Treino de perna + 30min cardio',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-01-20T07:00:00Z',
      tags: ['saude', 'fitness'],
      notionUrl: 'https://notion.so',
      xpReward: 25
    },
    {
      id: 'sample-3',
      title: 'Ler 30 paginas do livro',
      description: 'Continuar leitura do livro atual',
      status: 'pending',
      priority: 'low',
      createdAt: '2025-01-20T08:00:00Z',
      tags: ['leitura', 'habito'],
      notionUrl: 'https://notion.so',
      xpReward: 10
    },
    {
      id: 'sample-4',
      title: 'Finalizar relatorio do projeto',
      description: 'Enviar relatorio para revisao ate sexta',
      status: 'pending',
      priority: 'urgent',
      createdAt: '2025-01-18T10:00:00Z',
      dueDate: '2025-01-24',
      tags: ['trabalho'],
      notionUrl: 'https://notion.so',
      xpReward: 100
    },
    {
      id: 'sample-5',
      title: 'Organizar mesa de trabalho',
      description: 'Limpar, organizar cabos e documentos',
      status: 'completed',
      priority: 'low',
      createdAt: '2025-01-10T14:00:00Z',
      completedAt: '2025-01-20T16:30:00Z',
      tags: ['organizacao'],
      notionUrl: 'https://notion.so',
      xpReward: 10
    },
    {
      id: 'sample-6',
      title: 'Fazer deploy do projeto pessoal',
      description: 'Configurar CI/CD e publicar no GitHub Pages',
      status: 'completed',
      priority: 'high',
      createdAt: '2025-01-05T11:00:00Z',
      completedAt: '2025-01-19T18:00:00Z',
      tags: ['programacao', 'devops'],
      notionUrl: 'https://notion.so',
      xpReward: 50
    },
    {
      id: 'sample-7',
      title: 'Preparar apresentacao semanal',
      description: 'Slides sobre progresso do sprint',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-01-20T09:00:00Z',
      dueDate: '2025-01-22',
      tags: ['trabalho'],
      notionUrl: 'https://notion.so',
      xpReward: 25
    },
    {
      id: 'sample-8',
      title: 'Meditar 15 minutos',
      description: 'Sessao guiada de mindfulness',
      status: 'completed',
      priority: 'low',
      createdAt: '2025-01-20T06:00:00Z',
      completedAt: '2025-01-20T06:20:00Z',
      tags: ['saude', 'habito'],
      notionUrl: 'https://notion.so',
      xpReward: 10
    },
    {
      id: 'sample-9',
      title: 'Revisar pull requests pendentes',
      description: '3 PRs aguardando code review',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2025-01-19T13:00:00Z',
      tags: ['trabalho', 'programacao'],
      notionUrl: 'https://notion.so',
      xpReward: 50
    },
    {
      id: 'sample-10',
      title: 'Pagar conta de luz',
      description: 'Vence dia 25',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-01-15T10:00:00Z',
      dueDate: '2025-01-25',
      tags: ['financeiro'],
      notionUrl: 'https://notion.so',
      xpReward: 25
    }
  ],
  playerStats: {
    level: 3,
    currentXp: 20,
    xpToNextLevel: 300,
    totalXpEarned: 320,
    tasksCompleted: 3,
    currentStreak: 2,
    longestStreak: 5,
    title: 'Novato'
  },
  dailyQuests: [
    {
      id: 'daily-1',
      title: 'Completar 3 tarefas',
      target: 3,
      current: 1,
      xpReward: 50,
      completed: false
    },
    {
      id: 'daily-2',
      title: 'Completar 1 tarefa prioritaria',
      target: 1,
      current: 0,
      xpReward: 30,
      completed: false
    },
    {
      id: 'daily-3',
      title: 'Completar 5 tarefas',
      target: 5,
      current: 1,
      xpReward: 100,
      completed: false
    }
  ],
  lastSync: 'Modo Demo'
};

// Notion API client simples
async function notionRequest(endpoint, method = 'GET', body = null) {
  const url = `https://api.notion.com/v1${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Buscar tarefas do Notion
async function fetchTasks() {
  console.log('📋 Buscando tarefas do Notion...');

  const response = await notionRequest(
    `/databases/${NOTION_DATABASE_ID}/query`,
    'POST',
    {
      sorts: [
        { property: 'Status', direction: 'ascending' },
        { property: 'Prioridade', direction: 'descending' },
      ],
    }
  );

  return response.results;
}

// Mapear status do Notion para o app
function mapStatus(notionStatus) {
  const statusMap = {
    'A fazer': 'pending',
    'To Do': 'pending',
    'Pendente': 'pending',
    'Em progresso': 'in_progress',
    'In Progress': 'in_progress',
    'Fazendo': 'in_progress',
    'Concluído': 'completed',
    'Done': 'completed',
    'Feito': 'completed',
    'Completo': 'completed',
  };

  return statusMap[notionStatus] || 'pending';
}

// Mapear prioridade do Notion para o app
function mapPriority(notionPriority) {
  const priorityMap = {
    'Baixa': 'low',
    'Low': 'low',
    'Média': 'medium',
    'Medium': 'medium',
    'Normal': 'medium',
    'Alta': 'high',
    'High': 'high',
    'Urgente': 'urgent',
    'Urgent': 'urgent',
    'Crítica': 'urgent',
  };

  return priorityMap[notionPriority] || 'medium';
}

// Calcular XP baseado na prioridade
function calculateXp(priority) {
  const xpMap = {
    low: 10,
    medium: 25,
    high: 50,
    urgent: 100,
  };

  return xpMap[priority] || 25;
}

// Extrair texto de propriedade rich_text ou title
function extractText(property) {
  if (!property) return '';

  if (property.title) {
    return property.title.map(t => t.plain_text).join('');
  }

  if (property.rich_text) {
    return property.rich_text.map(t => t.plain_text).join('');
  }

  return '';
}

// Extrair valor de select
function extractSelect(property) {
  if (!property || !property.select) return null;
  return property.select.name;
}

// Extrair tags de multi_select
function extractTags(property) {
  if (!property || !property.multi_select) return [];
  return property.multi_select.map(t => t.name);
}

// Extrair data
function extractDate(property) {
  if (!property || !property.date) return null;
  return property.date.start;
}

// Transformar página do Notion em tarefa do app
function transformTask(page) {
  const props = page.properties;

  // Tenta diferentes nomes de propriedades comuns
  const title = extractText(props.Name) ||
                extractText(props.Nome) ||
                extractText(props.Title) ||
                extractText(props.Título) ||
                extractText(props.Tarefa) ||
                'Sem título';

  const description = extractText(props.Description) ||
                      extractText(props.Descrição) ||
                      extractText(props.Descricao) ||
                      '';

  const statusRaw = extractSelect(props.Status) ||
                    extractSelect(props.Estado) ||
                    'A fazer';

  const priorityRaw = extractSelect(props.Priority) ||
                      extractSelect(props.Prioridade) ||
                      extractSelect(props.Prioridade) ||
                      'Medium';

  const tags = extractTags(props.Tags) ||
               extractTags(props.Categorias) ||
               extractTags(props.Labels) ||
               [];

  const dueDate = extractDate(props['Due Date']) ||
                  extractDate(props.Data) ||
                  extractDate(props.Prazo) ||
                  extractDate(props['Data de entrega']) ||
                  null;

  const status = mapStatus(statusRaw);
  const priority = mapPriority(priorityRaw);
  const xpReward = calculateXp(priority);

  return {
    id: page.id,
    title,
    description: description || undefined,
    status,
    priority,
    dueDate: dueDate || undefined,
    completedAt: status === 'completed' ? page.last_edited_time : undefined,
    createdAt: page.created_time,
    tags: tags.length > 0 ? tags : undefined,
    notionUrl: page.url,
    xpReward,
  };
}

// Carregar stats salvos anteriormente
function loadPreviousStats() {
  try {
    if (existsSync(STATS_FILE)) {
      const data = readFileSync(STATS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    console.log('⚠️ Não foi possível carregar stats anteriores');
  }

  return {
    level: 1,
    currentXp: 0,
    xpToNextLevel: 100,
    totalXpEarned: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletionDate: null,
    title: 'Novato',
  };
}

// Calcular level baseado no XP
function calculateLevel(totalXp) {
  let level = 1;
  let xpNeeded = 100;
  let totalXpForLevel = 0;

  while (totalXp >= totalXpForLevel + xpNeeded) {
    totalXpForLevel += xpNeeded;
    level++;
    xpNeeded = 100 * level;
  }

  return {
    level,
    currentXp: totalXp - totalXpForLevel,
    xpToNextLevel: xpNeeded,
  };
}

// Determinar título baseado no nível
function getTitle(level) {
  if (level >= 50) return 'Monarca';
  if (level >= 40) return 'Lenda';
  if (level >= 30) return 'Mestre';
  if (level >= 25) return 'Elite';
  if (level >= 20) return 'Veterano';
  if (level >= 15) return 'Guerreiro';
  if (level >= 10) return 'Caçador';
  if (level >= 5) return 'Aprendiz';
  return 'Novato';
}

// Calcular streak
function calculateStreak(previousStats, tasksCompletedToday) {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = previousStats.lastCompletionDate;

  if (tasksCompletedToday > 0) {
    if (!lastDate) {
      return { currentStreak: 1, lastCompletionDate: today };
    }

    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        currentStreak: previousStats.currentStreak,
        lastCompletionDate: today,
      };
    } else if (diffDays === 1) {
      return {
        currentStreak: previousStats.currentStreak + 1,
        lastCompletionDate: today,
      };
    } else {
      return { currentStreak: 1, lastCompletionDate: today };
    }
  }

  return {
    currentStreak: previousStats.currentStreak,
    lastCompletionDate: previousStats.lastCompletionDate,
  };
}

// Calcular stats do player
function calculatePlayerStats(tasks, previousStats) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalXpEarned = completedTasks.reduce((sum, t) => sum + t.xpReward, 0);

  const today = new Date().toISOString().split('T')[0];
  const tasksCompletedToday = completedTasks.filter(t =>
    t.completedAt && t.completedAt.startsWith(today)
  ).length;

  const { level, currentXp, xpToNextLevel } = calculateLevel(totalXpEarned);
  const { currentStreak, lastCompletionDate } = calculateStreak(
    previousStats,
    tasksCompletedToday
  );

  const longestStreak = Math.max(previousStats.longestStreak, currentStreak);

  return {
    level,
    currentXp,
    xpToNextLevel,
    totalXpEarned,
    tasksCompleted: completedTasks.length,
    currentStreak,
    longestStreak,
    lastCompletionDate,
    title: getTitle(level),
  };
}

// Gerar missões diárias
function generateDailyQuests(tasks) {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = tasks.filter(
    t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(today)
  ).length;

  const highPriorityCompleted = tasks.filter(
    t =>
      t.status === 'completed' &&
      (t.priority === 'high' || t.priority === 'urgent') &&
      t.completedAt &&
      t.completedAt.startsWith(today)
  ).length;

  return [
    {
      id: 'daily-1',
      title: 'Completar 3 tarefas',
      target: 3,
      current: Math.min(completedToday, 3),
      xpReward: 50,
      completed: completedToday >= 3,
    },
    {
      id: 'daily-2',
      title: 'Completar 1 tarefa prioritaria',
      target: 1,
      current: Math.min(highPriorityCompleted, 1),
      xpReward: 30,
      completed: highPriorityCompleted >= 1,
    },
    {
      id: 'daily-3',
      title: 'Completar 5 tarefas',
      target: 5,
      current: Math.min(completedToday, 5),
      xpReward: 100,
      completed: completedToday >= 5,
    },
  ];
}

// Gerar dados de exemplo (modo demo)
function generateSampleData() {
  console.log('⚠️ Notion não configurado. Gerando dados de exemplo...\n');

  // Criar diretório se não existir
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Salvar dados de exemplo
  writeFileSync(OUTPUT_FILE, JSON.stringify(SAMPLE_DATA, null, 2));
  console.log(`✅ Dados de exemplo salvos em ${OUTPUT_FILE}`);

  // Salvar stats
  writeFileSync(STATS_FILE, JSON.stringify(SAMPLE_DATA.playerStats, null, 2));
  console.log(`✅ Stats salvos em ${STATS_FILE}`);

  console.log('\n🎮 Modo demo ativado!');
  console.log('📝 Configure NOTION_TOKEN e NOTION_DATABASE_ID para sincronizar com seu Notion.');
}

// Sincronizar com Notion
async function syncWithNotion() {
  console.log('🚀 Iniciando sincronização com Notion...\n');

  // Criar diretório de saída se não existir
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Buscar tarefas
  const notionPages = await fetchTasks();
  console.log(`✅ ${notionPages.length} páginas encontradas\n`);

  // Transformar tarefas
  const tasks = notionPages.map(transformTask);
  console.log('✅ Tarefas transformadas\n');

  // Carregar stats anteriores
  const previousStats = loadPreviousStats();

  // Calcular stats do player
  const playerStats = calculatePlayerStats(tasks, previousStats);
  console.log(`📊 Level: ${playerStats.level} | XP: ${playerStats.totalXpEarned}`);
  console.log(`🏆 Streak: ${playerStats.currentStreak} dias\n`);

  // Gerar missões diárias
  const dailyQuests = generateDailyQuests(tasks);

  // Montar dados finais
  const syncData = {
    tasks,
    playerStats,
    dailyQuests,
    lastSync: new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    }),
  };

  // Salvar JSON
  writeFileSync(OUTPUT_FILE, JSON.stringify(syncData, null, 2));
  console.log(`✅ Dados salvos em ${OUTPUT_FILE}`);

  // Salvar stats separadamente para persistência
  writeFileSync(STATS_FILE, JSON.stringify(playerStats, null, 2));
  console.log(`✅ Stats salvos em ${STATS_FILE}`);

  console.log('\n🎉 Sincronização concluída com sucesso!');
}

// Função principal
async function main() {
  // Verificar se Notion está configurado
  const notionConfigured = NOTION_TOKEN && NOTION_DATABASE_ID;

  if (!notionConfigured) {
    // Modo demo: gerar dados de exemplo
    generateSampleData();
    return;
  }

  // Modo normal: sincronizar com Notion
  try {
    await syncWithNotion();
  } catch (error) {
    console.error('\n❌ Erro durante sincronização:', error.message);
    console.log('\n⚠️ Gerando dados de exemplo como fallback...');
    generateSampleData();
  }
}

main();
