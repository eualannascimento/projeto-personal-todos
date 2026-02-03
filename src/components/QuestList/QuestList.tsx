import type { Task } from '../../types/task';
import { Panel } from '../Panel';
import { TaskCard } from '../TaskCard';
import styles from './QuestList.module.css';

interface QuestListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function QuestList({
  tasks,
  title = 'Missoes',
  emptyMessage = 'Nenhuma missao encontrada',
  className = ''
}: QuestListProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const sortedTasks = [...inProgressTasks, ...pendingTasks, ...completedTasks];

  const totalXp = tasks.reduce((sum, t) => sum + t.xpReward, 0);
  const completedXp = completedTasks.reduce((sum, t) => sum + t.xpReward, 0);

  return (
    <Panel
      title={title}
      variant="quest"
      className={`${styles.panel} ${className}`}
      icon={<QuestIcon />}
    >
      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{tasks.length}</span>
          <span className={styles.summaryLabel}>Total</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.inProgress}`}>
            {inProgressTasks.length}
          </span>
          <span className={styles.summaryLabel}>Em Progresso</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.completed}`}>
            {completedTasks.length}
          </span>
          <span className={styles.summaryLabel}>Completas</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.summaryValue} ${styles.xp}`}>
            {completedXp}/{totalXp}
          </span>
          <span className={styles.summaryLabel}>XP</span>
        </div>
      </div>

      {/* Task List */}
      <div className={styles.list}>
        {sortedTasks.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          sortedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </Panel>
  );
}

function QuestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
