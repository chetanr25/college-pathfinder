import React from 'react';
import theme from '../../theme';
import GlowingOrb from './GlowingOrb';
import Container from './Container';

export interface HeroProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  background?: 'gradient' | 'mesh' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withNavbar?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  icon,
  title,
  subtitle,
  actions,
  background = 'gradient',
  size = 'lg',
  className = '',
  withNavbar = true,
}) => {
  const sizes = {
    sm: {
      padding: `${theme.spacing[10]} ${theme.spacing[6]}`,
      paddingTop: withNavbar ? 'calc(72px + 2.5rem)' : theme.spacing[10],
      titleSize: 'clamp(1.5rem, 4vw, 1.875rem)',
      subtitleSize: 'clamp(0.875rem, 2vw, 1rem)',
      iconSize: '56px',
    },
    md: {
      padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
      paddingTop: withNavbar ? 'calc(72px + 3rem)' : theme.spacing[12],
      titleSize: 'clamp(1.75rem, 5vw, 2.25rem)',
      subtitleSize: 'clamp(0.95rem, 2vw, 1.125rem)',
      iconSize: '64px',
    },
    lg: {
      padding: `${theme.spacing[16]} ${theme.spacing[6]}`,
      paddingTop: withNavbar ? 'calc(72px + 4rem)' : theme.spacing[16],
      titleSize: 'clamp(2rem, 6vw, 3rem)',
      subtitleSize: 'clamp(1rem, 2.5vw, 1.25rem)',
      iconSize: '72px',
    },
  };

  const backgrounds = {
    gradient: theme.colors.primary.gradient,
    mesh: theme.colors.background.mesh,
  };

  const heroStyles: React.CSSProperties = {
    position: 'relative',
    background: backgrounds[background as keyof typeof backgrounds] || background,
    padding: sizes[size].padding,
    paddingTop: sizes[size].paddingTop,
    paddingBottom: theme.spacing[12],
    overflow: 'hidden',
  };

  const contentStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
  };

  const iconWrapperStyles: React.CSSProperties = {
    width: sizes[size].iconSize,
    height: sizes[size].iconSize,
    borderRadius: theme.borderRadius.xl,
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[4],
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    color: theme.colors.text.inverse,
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizes[size].titleSize,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[3],
    lineHeight: 1.25,
  };

  const subtitleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizes[size].subtitleSize,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: actions ? theme.spacing[6] : 0,
    lineHeight: 1.6,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  return (
    <section className={`hero ${className}`} style={heroStyles}>
      <GlowingOrb top="-30%" right="-10%" size={500} opacity={0.15} />
      <GlowingOrb bottom="-40%" left="-15%" size={600} color="rgba(236, 72, 153, 0.3)" opacity={0.1} />
      
      <Container maxWidth="lg">
        <div style={contentStyles}>
          {icon && <div style={iconWrapperStyles}>{icon}</div>}
          <h1 style={titleStyles}>{title}</h1>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          {actions && (
            <div style={{ 
              display: 'flex', 
              gap: theme.spacing[3], 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              {actions}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Hero;

