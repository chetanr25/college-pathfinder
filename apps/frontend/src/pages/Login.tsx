/**
 * Login Page - Google OAuth Sign In (JWT flow)
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Google,
  School,
  ArrowBack,
  LockOutlined,
} from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/ai-chat');
    }
  }, [user, loading, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSigningIn(true);
      setError(null);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch Google user info');
        const userInfo = await res.json();
        await signInWithGoogle(
          userInfo.sub,
          userInfo.email,
          userInfo.name,
          userInfo.picture,
        );
        navigate('/ai-chat');
      } catch (err) {
        console.error('Sign in failed:', err);
        setError('Sign in failed. Please try again.');
      } finally {
        setSigningIn(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
      setError('Google sign in was cancelled or failed.');
    },
  });

  const handleGoogleSignIn = () => {
    setError(null);
    googleLogin();
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingRing} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <SEO title="Sign In" />
      {/* ── Left panel – brand side ── */}
      <div style={styles.left}>
        {/* Decorative circles */}
        <div style={styles.orb1} />
        <div style={styles.orb2} />

        <div style={styles.leftInner}>
          {/* Logo mark */}
          <div style={styles.logoMark}>
            <School style={{ fontSize: '1.4rem', color: '#fff' }} />
          </div>

          <h1 style={styles.brandName}>College<br />Path Finder</h1>

          <p style={styles.brandDesc}>
            Navigate your KCET journey with real cutoff data,
            AI-powered guidance, and personalised college shortlists.
          </p>
        </div>
      </div>

      {/* ── Right panel – sign-in form ── */}
      <div style={styles.right}>
        {/* Back link */}
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowBack style={{ fontSize: '0.95rem' }} />
          <span>Home</span>
        </button>

        <div style={styles.form} className="fade-in">
          {/* Lock icon */}
          <div style={styles.lockIcon}>
            <LockOutlined style={{ fontSize: '1.25rem', color: '#4F46E5' }} />
          </div>

          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>
            Sign in to access your AI counselor and saved sessions.
          </p>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerLabel}>sign in with</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Google button */}
          <button
            style={{
              ...styles.googleBtn,
              ...(btnHovered && !signingIn ? styles.googleBtnHover : {}),
              cursor: signingIn ? 'not-allowed' : 'pointer',
              opacity: signingIn ? 0.75 : 1,
            }}
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {signingIn ? (
              <div style={styles.btnSpinner} />
            ) : (
              <Google style={{ fontSize: '1.2rem' }} />
            )}
            <span style={{ fontWeight: 600 }}>
              {signingIn ? 'Signing in…' : 'Continue with Google'}
            </span>
          </button>

          {error && <p style={styles.errorMsg}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

const styles: Record<string, React.CSSProperties> = {
  /* ── Full-page layout ── */
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },

  /* ── Left branding panel ── */
  left: {
    flex: '0 0 44%',
    background: GRADIENT,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  orb1: {
    position: 'absolute',
    top: '-15%',
    right: '-10%',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    filter: 'blur(48px)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    filter: 'blur(56px)',
    pointerEvents: 'none',
  },
  leftInner: {
    position: 'relative',
    zIndex: 1,
    color: '#fff',
    maxWidth: '380px',
  },
  logoMark: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  brandName: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.1,
    margin: '0 0 20px 0',
    letterSpacing: '-0.5px',
  },
  brandDesc: {
    fontSize: '1rem',
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.78)',
    margin: '0 0 40px 0',
  },

  /* ── Right sign-in panel ── */
  right: {
    flex: 1,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: '32px',
    left: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  form: {
    width: '100%',
    maxWidth: '360px',
  },
  lockIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  formTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  formSub: {
    fontSize: '0.9rem',
    color: '#6B7280',
    lineHeight: 1.6,
    margin: '0 0 28px 0',
  },

  /* Divider */
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#E5E7EB',
  },
  dividerLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap' as const,
  },

  /* Google button */
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 20px',
    background: GRADIENT,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
  },
  googleBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 22px rgba(102, 126, 234, 0.45)',
  },
  btnSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },

  /* Misc */
  errorMsg: {
    fontSize: '0.8rem',
    color: '#EF4444',
    margin: '0 0 12px 0',
    textAlign: 'center' as const,
  },
  /* Loading screen */
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: GRADIENT,
  },
  loadingRing: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

export default Login;
