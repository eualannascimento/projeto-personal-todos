import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showValues?: boolean;
  variant?: 'hp' | 'mp' | 'xp' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showValues = true,
  variant = 'default',
  size = 'md',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={`${styles.track} ${styles[size]}`}>
        <div
          className={`${styles.fill} ${styles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
        <div className={styles.shine} />
      </div>
      {showValues && (
        <span className={styles.values}>
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      )}
    </div>
  );
}
