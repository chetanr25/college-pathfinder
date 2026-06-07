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
    const handleScroll = () => setScrolled(window.scrollY > 12);
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

  const navbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'blur(12px) saturate(150%)',
    WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(200%)' : 'blur(12px) saturate(150%)',
    backgroundColor: scrolled
      ? 'rgba(8, 8, 18, 0.82)'
      : 'rgba(8, 8, 18, 0.35)',
    borderBottom: scrolled
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(255,255,255,0.04)',
    boxShadow: scrolled
      ? '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
      : 'none',
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
              padding: mobile ? '13px 16px' : '9px 15px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              borderRadius: '10px',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              color: active ? '#ffffff' : 'rgba(255,255,255,0.62)',
              background: active
                ? 'linear-gradient(135deg, rgba(102,126,234,0.85) 0%, rgba(118,75,162,0.85) 100%)'
                : 'transparent',
              boxShadow: active ? '0 4px 16px rgba(102,126,234,0.35)' : 'none',
              border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              ...(mobile ? { width: '100%', marginBottom: '4px' } : {}),
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.62)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
            onClick={() => mobile && setMobileMenuOpen(false)}
          >
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem' }}>
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
          <IconButton onClick={handleMenuOpen} sx={{ ml: mobile ? 0 : '4px' }}>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} sx={{ width: 34, height: 34 }} />
            ) : (
              <AccountCircle sx={{ fontSize: 34, color: 'rgba(255,255,255,0.7)' }} />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '14px',
                background: 'rgba(15,15,28,0.92)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                minWidth: '200px',
                mt: '8px',
              }
            }}
          >
            <MenuItem disabled sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {user.name}
            </MenuItem>
            <MenuItem disabled sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.825rem' }}>
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
            gap: '8px',
            padding: mobile ? '9px 18px' : '9px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginLeft: mobile ? 0 : '6px',
            marginRight: mobile ? '6px' : 0,
            boxShadow: '0 4px 18px rgba(102,126,234,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(102,126,234,0.55)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(102,126,234,0.4)';
          }}
          onClick={() => mobile && setMobileMenuOpen(false)}
        >
          <Login style={{ fontSize: '1.15rem' }} />
          <span>Sign In</span>
        </Link>
      )}
    </>
  );

  return (
    <nav style={navbarStyle}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '52px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(102,126,234,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <School style={{ fontSize: '1.35rem', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '1.1rem',
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
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              FINDER
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
              sx={{ color: 'rgba(255,255,255,0.75)', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}
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
            marginBottom: '24px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {renderNavLinks(true)}
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;
