import React from 'react';
import { CircularProgress } from '@mui/material';
import theme from '../theme';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 60,
  fullScreen = false,
  message = 'Loading...',
}) => {
  if (fullScreen) {
    return (
      <div style={styles.fullScreen}>
        <CircularProgress size={size} style={styles.spinner} />
        <p style={styles.message}>{message}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <CircularProgress size={size} style={styles.spinner} />
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  fullScreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.background.default,
    zIndex: theme.zIndex.modal,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
    gap: theme.spacing[4],
  },
  spinner: {
    color: theme.colors.primary.main,
  },
  message: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
};

export default LoadingSpinner;
