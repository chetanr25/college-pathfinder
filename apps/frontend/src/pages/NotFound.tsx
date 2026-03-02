import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, SearchOff } from '@mui/icons-material';
import { Container, Button, Card } from '../components/ui';
import theme from '../theme';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Container maxWidth="md">
        <Card variant="elevated" padding={12} style={{ textAlign: 'center' }}>
          <div style={styles.iconWrapper}>
            <SearchOff style={{ fontSize: '5rem', color: theme.colors.neutral[400] }} />
          </div>
          
          <h1 style={styles.title}>404</h1>
          <h2 style={styles.subtitle}>Page Not Found</h2>
          
          <p style={styles.description}>
            Oops! The page you're looking for doesn't exist. 
            It might have been moved or deleted.
          </p>
          
          <div style={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              icon={<Home />}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    paddingTop: '72px', // Navbar height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.background.mesh,
    padding: theme.spacing[6],
  },
  iconWrapper: {
    marginBottom: theme.spacing[4],
  },
  title: {
    margin: 0,
    fontSize: 'clamp(4rem, 10vw, 5rem)',
    fontWeight: theme.typography.fontWeight.bold,
    background: theme.colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    margin: 0,
    fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  description: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[6],
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing[4],
  },
};

export default NotFound;

