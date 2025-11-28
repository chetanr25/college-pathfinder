/**
 * Login Page - Google OAuth Sign In
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Google, School, AutoAwesome } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      navigate('/ai-chat');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />
      
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <School style={styles.logoIcon} />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Welcome to College Path Finder</h1>
        <p style={styles.subtitle}>
          Sign in to access your personalized AI College Counselor and save your chat history
        </p>

        {/* Features */}
        <div style={styles.features}>
          <div style={styles.featureItem}>
            <AutoAwesome style={{ color: '#fbbf24', fontSize: '1.25rem' }} />
            <span>Personalized AI guidance</span>
          </div>
          <div style={styles.featureItem}>
            <AutoAwesome style={{ color: '#60a5fa', fontSize: '1.25rem' }} />
            <span>Save your chat history</span>
          </div>
          <div style={styles.featureItem}>
            <AutoAwesome style={{ color: '#a78bfa', fontSize: '1.25rem' }} />
            <span>Access across devices</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button style={styles.googleButton} onClick={handleGoogleSignIn}>
          <Google style={{ fontSize: '1.5rem' }} />
          <span>Continue with Google</span>
        </button>

        {/* Privacy Note */}
        <p style={styles.privacyNote}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* Back Link */}
        <button 
          style={styles.backButton}
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgBlob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  card: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    padding: '48px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(20px)',
  },
  logoWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
  },
  logoIcon: {
    fontSize: '2.5rem',
    color: '#ffffff',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1F2937',
    margin: '0 0 12px 0',
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6B7280',
    margin: '0 0 32px 0',
    lineHeight: 1.6,
  },
  features: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '32px',
    padding: '20px',
    background: '#F9FAFB',
    borderRadius: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.875rem',
    color: '#374151',
    fontWeight: 500,
  },
  googleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: '#ffffff',
    color: '#374151',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  },
  privacyNote: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    margin: '0 0 24px 0',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingSpinner: {
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
};

export default Login;

