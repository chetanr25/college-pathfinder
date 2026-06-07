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
import ServerDownCard from '../components/ServerDownCard';
import { useServerStatus } from '../hooks/useServerStatus';

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const isMobile = useIsMobile();
  const { status: serverStatus } = useServerStatus();

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

  if (loading || serverStatus === 'checking') {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingRing} />
      </div>
    );
  }

  if (serverStatus === 'down') {
    return <ServerDownCard />;
  }

  /* ── Mobile layout ── */
  if (isMobile) {
    return (
      <div style={styles.mobilePage}>
        <SEO title="Sign In" />

        {/* Gradient header */}
        <div style={styles.mobileHeader}>
          <div style={styles.orb1} />
          <div style={styles.orb2} />
          <button style={styles.mobileBackBtn} onClick={() => navigate('/')}>
            <ArrowBack style={{ fontSize: '1rem' }} />
          </button>
          <div style={styles.mobileHeaderContent}>
            <div style={styles.logoMark}>
              <School style={{ fontSize: '1.2rem', color: '#fff' }} />
            </div>
            <h1 style={styles.mobileBrandName}>College Path Finder</h1>
            <p style={styles.mobileBrandDesc}>
              Navigate your KCET journey with real cutoff data and AI-powered guidance.
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={styles.mobileCard}>
          <div style={styles.lockIcon}>
            <LockOutlined style={{ fontSize: '1.25rem', color: '#4F46E5' }} />
          </div>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>Sign in to access your AI counselor and saved sessions.</p>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerLabel}>sign in with</span>
            <div style={styles.dividerLine} />
          </div>

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
    );
  }

  /* ── Desktop layout ── */
  return (
    <div style={styles.page}>
      <SEO title="Sign In" />
      {/* ── Left panel – brand side ── */}
      <div style={styles.left}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.leftInner}>
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
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowBack style={{ fontSize: '0.95rem' }} />
          <span>Home</span>
        </button>

        <div style={styles.form} className="fade-in">
          <div style={styles.lockIcon}>
            <LockOutlined style={{ fontSize: '1.25rem', color: '#4F46E5' }} />
          </div>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>
            Sign in to access your AI counselor and saved sessions.
          </p>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerLabel}>sign in with</span>
            <div style={styles.dividerLine} />
          </div>

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

const styles: Record<string, React.CSSProperties> = {
  /* ── Desktop full-page layout ── */
  page: {
    display: 'flex',
    minHeight: '100vh',
    paddingTop: 'var(--navbar-height, 80px)',
    fontFamily: "'Inter', sans-serif",
  },

  /* ── Desktop left branding panel ── */
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

  /* ── Desktop right sign-in panel ── */
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

  /* ── Mobile layout ── */
  mobilePage: {
    minHeight: '100vh',
    paddingTop: 'var(--navbar-height, 80px)',
    background: '#F9FAFB',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column' as const,
  },
  mobileHeader: {
    background: GRADIENT,
    position: 'relative',
    overflow: 'hidden',
    padding: '48px 24px 56px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  mobileBackBtn: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '8px',
    padding: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    position: 'relative',
    zIndex: 1,
  },
  mobileHeaderContent: {
    position: 'relative',
    zIndex: 1,
    color: '#fff',
  },
  mobileBrandName: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: '16px 0 10px',
    letterSpacing: '-0.3px',
    color: '#fff',
  },
  mobileBrandDesc: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
  mobileCard: {
    background: '#fff',
    borderRadius: '24px 24px 0 0',
    marginTop: '-24px',
    flex: 1,
    padding: '32px 24px 40px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 2,
  },

  /* ── Shared form elements ── */
  lockIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  formTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  formSub: {
    fontSize: '0.9rem',
    color: '#6B7280',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
  },
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
  errorMsg: {
    fontSize: '0.8rem',
    color: '#EF4444',
    margin: '0 0 12px 0',
    textAlign: 'center' as const,
  },
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
