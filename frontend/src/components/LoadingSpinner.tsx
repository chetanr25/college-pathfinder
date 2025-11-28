import React from 'react';
import { CircularProgress } from '@mui/material';
import theme from '../theme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
  size = 60,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
    ...(fullScreen
      ? {
          minHeight: '100vh',
          background: theme.colors.background.mesh,
        }
      : {
          padding: theme.spacing[12],
        }),
  };

  const spinnerWrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size + 40,
    height: size + 40,
  };

  const glowStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: theme.colors.primary.gradient,
    opacity: 0.2,
    filter: 'blur(20px)',
    animation: 'pulse 2s ease-in-out infinite',
  };

  const messageStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  };

  return (
    <div style={containerStyles}>
      <div style={spinnerWrapperStyles}>
        <div style={glowStyles} />
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            position: 'relative',
            zIndex: 1,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
            color: theme.colors.primary.main,
          }}
        />
      </div>
      {message && <p style={messageStyles}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
