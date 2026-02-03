import type { PlayerStats } from '../../types/task';
import { Panel } from '../Panel';
import { ProgressBar } from '../ProgressBar';
import styles from './StatusPanel.module.css';

interface StatusPanelProps {
  stats: PlayerStats;
  className?: string;
}

const titles: Record<number, string> = {
  1: 'Novato',
  5: 'Aprendiz',
  10: 'Caçador',
  15: 'Guerreiro',
  20: 'Veterano',
  25: 'Elite',
  30: 'Mestre',
  40: 'Lenda',
  50: 'Monarca'
};

function getTitle(level: number): string {
  const levels = Object.keys(titles).map(Number).sort((a, b) => b - a);
  for (const l of levels) {
    if (level >= l) return titles[l];
  }
  return 'Novato';
}

export function StatusPanel({ stats, className = '' }: StatusPanelProps) {
  const title = stats.title || getTitle(stats.level);

  return (
    <Panel
      title="Status"
      variant="status"
      className={`${styles.panel} ${className}`}
      icon={<StatusIcon />}
    >
      <div className={styles.grid}>
        {/* Basic Info */}
        <div className={styles.basicInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>TITULO:</span>
            <span className={styles.value}>{title}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>LEVEL:</span>
            <span className={styles.levelValue}>{stats.level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className={styles.xpSection}>
          <ProgressBar
            current={stats.currentXp}
            max={stats.xpToNextLevel}
            label="XP"
            variant="xp"
            size="lg"
          />
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>⚔️</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>TAREFAS</span>
              <span className={styles.statValue}>{stats.tasksCompleted}</span>
            </div>
          </div>

          <div className={styles.stat}>
            <span className={styles.statIcon}>🔥</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>STREAK</span>
              <span className={styles.statValue}>{stats.currentStreak} dias</span>
            </div>
          </div>

          <div className={styles.stat}>
            <span className={styles.statIcon}>🏆</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>RECORDE</span>
              <span className={styles.statValue}>{stats.longestStreak} dias</span>
            </div>
          </div>

          <div className={styles.stat}>
            <span className={styles.statIcon}>✨</span>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>XP TOTAL</span>
              <span className={styles.statValue}>{stats.totalXpEarned.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function StatusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
