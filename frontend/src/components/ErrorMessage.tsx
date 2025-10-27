import React from 'react';
import { Error as ErrorIcon } from '@mui/icons-material';
import theme from '../theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <ErrorIcon style={styles.icon} />
      </div>
      <h3 style={styles.title}>Oops! Something went wrong</h3>
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button style={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
    textAlign: 'center' as const,
    gap: theme.spacing[3],
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.full,
    background: theme.colors.error.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  icon: {
    fontSize: '2.5rem',
    color: theme.colors.error.main,
  },
  title: {
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  message: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    maxWidth: '500px',
  },
  retryButton: {
    marginTop: theme.spacing[2],
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    background: theme.colors.primary.gradient,
    color: theme.colors.text.inverse,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: theme.transitions.base,
    boxShadow: theme.shadows.md,
  },
};

export default ErrorMessage;
