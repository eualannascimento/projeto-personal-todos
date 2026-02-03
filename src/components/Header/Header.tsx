import styles from './Header.module.css';

interface HeaderProps {
  lastSync?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({ lastSync, onRefresh, isLoading = false }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>H</span>
          </div>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Hunter System</h1>
            <span className={styles.subtitle}>Sistema de Missoes</span>
          </div>
        </div>

        <div className={styles.actions}>
          {lastSync && (
            <span className={styles.syncInfo}>
              Ultima sync: {lastSync}
            </span>
          )}

          {onRefresh && (
            <button
              className={`${styles.refreshBtn} ${isLoading ? styles.loading : ''}`}
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar dados"
            >
              <svg
                className={styles.refreshIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.borderGlow} />
    </header>
  );
}
