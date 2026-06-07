import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  School,
  Category,
  Home as HomeIcon,
  TrendingUp,
  SmartToy,
  Login,
  Logout,
  AccountCircle,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material';
import { Menu, MenuItem, IconButton, Avatar, Drawer, useMediaQuery } from '@mui/material';
import theme from '../theme';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface NavbarProps {
  user?: User | null;
  onSignOut?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/colleges', label: 'Colleges', icon: <School /> },
    { path: '/branches', label: 'Branches', icon: <Category /> },
    { path: '/predictor', label: 'Predictor', icon: <TrendingUp /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <SmartToy />, requiresAuth: true },
  ];

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleSignOut = () => { handleMenuClose(); setMobileMenuOpen(false); onSignOut?.(); };

  /* Floating pill: sits 12px from the top, leaves 16px on each side */
  const pillStyle: React.CSSProperties = {
    position: 'fixed',
    top: '12px',
    left: '16px',
    right: '16px',
    zIndex: 9999,
    borderRadius: '18px',
    backdropFilter: 'blur(40px) saturate(220%) brightness(0.85)',
    WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(0.85)',
    backgroundColor: scrolled
      ? 'rgba(8, 8, 20, 0.88)'
      : 'rgba(8, 8, 20, 0.65)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: scrolled
      ? '0 16px 56px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.04)'
      : '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const renderNavLinks = (mobile = false) => (
    <>
      {navLinks.map((link) => {
        const active = isActive(link.path);
        return (
          <Link
            key={link.path}
            to={link.requiresAuth && !user ? '/login' : link.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: mobile ? '13px 16px' : '8px 14px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              borderRadius: '11px',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              color: active ? '#ffffff' : 'rgba(255,255,255,0.58)',
              background: active
                ? 'linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)'
                : 'transparent',
              boxShadow: active ? '0 3px 14px rgba(102,126,234,0.4)' : 'none',
              border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
              ...(mobile ? { width: '100%', marginBottom: '2px' } : {}),
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.92)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.58)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.05rem' }}>
              {link.icon}
            </span>
            <span style={{ fontFamily: theme.typography.fontFamily.primary }}>{link.label}</span>
          </Link>
        );
      })}
    </>
  );

  const renderAuthSection = (mobile = false) => (
    <>
      {user ? (
        <>
          <IconButton onClick={handleMenuOpen} sx={{ ml: mobile ? 0 : '2px' }}>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle sx={{ fontSize: 32, color: 'rgba(255,255,255,0.65)' }} />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: 'rgba(12,12,24,0.95)',
                backdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                minWidth: '200px',
                mt: '10px',
              }
            }}
          >
            <MenuItem sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, pointerEvents: 'none', fontSize: '0.95rem' }}>
              {user.name}
            </MenuItem>
            <MenuItem sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', pointerEvents: 'none', pt: 0 }}>
              {user.email}
            </MenuItem>
            <MenuItem
              onClick={handleSignOut}
              sx={{ color: '#f87171', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}
            >
              <Logout sx={{ mr: 1, fontSize: '1.2rem' }} />
              Sign Out
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Link
          to="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 18px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '11px',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginLeft: mobile ? 0 : '4px',
            marginRight: mobile ? '6px' : 0,
            boxShadow: '0 4px 16px rgba(102,126,234,0.45)',
            border: '1px solid rgba(255,255,255,0.16)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 26px rgba(102,126,234,0.6)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(102,126,234,0.45)';
          }}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <Login style={{ fontSize: '1.1rem' }} />
          <span>Sign In</span>
        </Link>
      )}
    </>
  );

  return (
    <nav style={pillStyle}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '48px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(102,126,234,0.45)',
            border: '1px solid rgba(255,255,255,0.16)',
            flexShrink: 0,
          }}>
            <School style={{ fontSize: '1.2rem', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #c4caff 0%, #e0c3fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}>
              College Path
            </span>
            <span style={{
              fontSize: '0.58rem',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              FINDER
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {renderNavLinks()}
            {renderAuthSection()}
          </div>
        )}

        {/* Mobile actions */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {renderAuthSection(true)}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}
            >
              <MenuIcon />
            </IconButton>
          </div>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen && isMobile}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            sx: {
              width: '280px',
              background: 'rgba(10,10,22,0.97)',
              backdropFilter: 'blur(30px)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              padding: '20px',
            }
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              Menu
            </span>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}
            >
              <Close />
            </IconButton>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {renderNavLinks(true)}
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;
