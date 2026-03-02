/**
 * Authentication Context
 * JWT-based auth — stores token in localStorage, validates via /auth/me on mount
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  /** Pass the Google access token + decoded user info to authenticate against our backend. */
  signInWithGoogle: (token: string, email: string, name: string, avatarUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData: AppUser = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Sign in using a Google token + user info. The `token` is sent to POST /auth/google,
   * which records it as the user's google_id and returns a signed JWT.
   */
  const signInWithGoogle = useCallback(async (token: string, email: string, name: string, avatarUrl?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        email,
        name,
        avatar_url: avatarUrl ?? null,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
