import type { Task } from '../../types/task';
import { Button } from '../Button';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

const priorityLabels: Record<string, string> = {
  low: 'BAIXA',
  medium: 'MEDIA',
  high: 'ALTA',
  urgent: 'URGENTE'
};

const statusLabels: Record<string, string> = {
  pending: 'PENDENTE',
  in_progress: 'EM PROGRESSO',
  completed: 'COMPLETA'
};

export function TaskCard({ task }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div className={`${styles.card} ${styles[task.status]} ${styles[`priority-${task.priority}`]}`}>
      <div className={styles.statusIndicator} />

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={`${styles.status} ${styles[task.status]}`}>
            [{statusLabels[task.status]}]
          </span>
          <span className={`${styles.priority} ${styles[`priority-${task.priority}`]}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>

        <h3 className={`${styles.title} ${isCompleted ? styles.completed : ''}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.xpBadge}>
            <span className={styles.xpIcon}>★</span>
            <span>+{task.xpReward} XP</span>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className={styles.tags}>
              {task.tags.map(tag => (
                <span key={tag} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          <a
            href={task.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.notionLink}
          >
            <Button variant="ghost" size="sm">
              Abrir no Notion
            </Button>
          </a>
        </div>
      </div>

      {isCompleted && (
        <div className={styles.completedOverlay}>
          <span className={styles.checkmark}>✓</span>
        </div>
      )}
    </div>
  );
}
