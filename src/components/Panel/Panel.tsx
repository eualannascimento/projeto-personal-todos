import type { ReactNode } from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  variant?: 'default' | 'quest' | 'status' | 'reward';
}

export function Panel({
  title,
  icon,
  children,
  className = '',
  onClose,
  variant = 'default'
}: PanelProps) {
  return (
    <div className={`${styles.panel} ${styles[variant]} ${className}`}>
      {/* Corner decorations */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />

      {/* Header */}
      {(title || onClose) && (
        <div className={styles.header}>
          {title && (
            <h2 className={styles.title}>
              {icon && <span className={styles.icon}>{icon}</span>}
              {title}
            </h2>
          )}
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
              <span className={styles.closeLine} />
              <span>X</span>
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
