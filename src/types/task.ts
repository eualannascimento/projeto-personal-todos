export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  tags?: string[];
  notionUrl: string;
  xpReward: number;
}

export interface PlayerStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  title: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  completed: boolean;
}

export interface SyncData {
  tasks: Task[];
  playerStats: PlayerStats;
  dailyQuests: DailyQuest[];
  lastSync: string;
}
