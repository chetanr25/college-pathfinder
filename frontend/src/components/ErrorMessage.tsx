import React from 'react';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';
import { Card, Button, Container } from './ui';
import theme from '../theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  fullScreen = false,
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen
      ? {
          minHeight: '100vh',
          background: theme.colors.background.default,
        }
      : {
    padding: theme.spacing[8],
        }),
  };

  return (
    <div style={containerStyles}>
      <Container maxWidth="md">
        <Card variant="elevated" padding={8} style={{ textAlign: 'center' }}>
          <div
            style={{
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.full,
    background: theme.colors.error.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
              margin: '0 auto',
              marginBottom: theme.spacing[4],
            }}
          >
            <ErrorIcon style={{ fontSize: '2.5rem', color: theme.colors.error.main }} />
          </div>
          
          <h2
            style={{
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
              marginBottom: theme.spacing[3],
            }}
          >
            Oops! Something went wrong
          </h2>
          
          <p
            style={{
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
              lineHeight: theme.typography.lineHeight.relaxed,
              marginBottom: theme.spacing[6],
            }}
          >
            {message}
          </p>
          
          {onRetry && (
            <Button
              variant="primary"
              size="lg"
              icon={<Refresh />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default ErrorMessage;
