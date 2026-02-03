import type { DailyQuest } from '../../types/task';
import { Panel } from '../Panel';
import { ProgressBar } from '../ProgressBar';
import styles from './DailyQuests.module.css';

interface DailyQuestsProps {
  quests: DailyQuest[];
  className?: string;
}

export function DailyQuests({ quests, className = '' }: DailyQuestsProps) {
  const completedQuests = quests.filter(q => q.completed);
  const allCompleted = quests.length > 0 && completedQuests.length === quests.length;

  return (
    <Panel
      title="Missoes Diarias"
      variant={allCompleted ? 'reward' : 'quest'}
      className={`${styles.panel} ${className}`}
      icon={<TimerIcon />}
    >
      <div className={styles.header}>
        <span className={styles.goal}>META</span>
        {allCompleted && (
          <span className={styles.allComplete}>TODAS COMPLETAS!</span>
        )}
      </div>

      <div className={styles.questList}>
        {quests.map(quest => (
          <div
            key={quest.id}
            className={`${styles.quest} ${quest.completed ? styles.completed : ''}`}
          >
            <div className={styles.questInfo}>
              <span className={styles.questStatus}>
                [{quest.completed ? 'COMPLETO' : 'INCOMPLETO'}]
              </span>
              <span className={styles.questTitle}>{quest.title}</span>
            </div>

            <div className={styles.questProgress}>
              <ProgressBar
                current={quest.current}
                max={quest.target}
                showValues={false}
                variant={quest.completed ? 'xp' : 'default'}
                size="sm"
              />
              <span className={styles.questCount}>
                [{quest.current}/{quest.target}]
              </span>
              {quest.completed && (
                <span className={styles.checkmark}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.warning}>
        <span className={styles.warningIcon}>⚠️</span>
        <span>AVISO! - Falhar em completar missoes diarias traz consequencias.</span>
      </div>

      <div className={styles.timer}>
        <TimerIcon />
      </div>
    </Panel>
  );
}

function TimerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
