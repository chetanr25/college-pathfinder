/**
 * Auth Callback Page
 * Handles OAuth redirect from Supabase
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    let mounted = true;
    
    const handleCallback = async () => {
      try {
        // First, check if we already have a session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession && mounted) {
          setStatus('Already authenticated! Redirecting...');
          navigate('/ai-chat', { replace: true });
          return;
        }
        
        setStatus('Completing sign in...');
        
        // Check if we have hash params (OAuth redirect with tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Check if we have query params (OAuth code flow)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          if (mounted) {
            setStatus(`Error: ${errorDescription || error}`);
            setTimeout(() => navigate('/login'), 2000);
          }
          return;
        }

        // If we have a code, exchange it for a session
        if (code) {
          setStatus('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            if (mounted) {
              setStatus('Authentication failed. Redirecting...');
              setTimeout(() => navigate('/login'), 2000);
            }
            return;
          }
          
          if (data.session && mounted) {
            setStatus('Success! Redirecting...');
            navigate('/ai-chat', { replace: true });
            return;
          }
        }
        
        // If we have tokens in hash (implicit flow)
        if (accessToken) {
          setStatus('Setting up session...');
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (setError) {
            console.error('Session set error:', setError);
            if (mounted) {
              setStatus('Session setup failed. Redirecting...');
              setTimeout(() => navigate('/login'), 2000);
            }
            return;
          }
          
          if (data.session && mounted) {
            setStatus('Success! Redirecting...');
            navigate('/ai-chat', { replace: true });
            return;
          }
        }
        
        // No code/tokens and no session - redirect to login
        if (mounted) {
          setStatus('No session found. Redirecting to login...');
          setTimeout(() => navigate('/login'), 1500);
        }
        
      } catch (error) {
        console.error('Callback error:', error);
        if (mounted) {
          setStatus('An error occurred. Redirecting...');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    };

    handleCallback();
    
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
        </div>
        <p style={styles.text}>{status}</p>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
  },
  content: {
    textAlign: 'center' as const,
  },
  spinnerContainer: {
    marginBottom: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  text: {
    color: '#ffffff',
    fontSize: '1.125rem',
    fontWeight: 500,
  },
};

export default AuthCallback;
