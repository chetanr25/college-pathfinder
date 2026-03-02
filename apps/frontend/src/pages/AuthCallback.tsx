/**
 * Auth Callback Page
 * No longer used — JWT auth does not need an OAuth redirect callback.
 * Redirects to login for any stale bookmarks.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <p style={{ color: '#fff', fontSize: '1.25rem' }}>Redirecting...</p>
    </div>
  );
};

export default AuthCallback;
