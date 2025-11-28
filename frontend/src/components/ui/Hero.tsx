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
}

const Hero: React.FC<HeroProps> = ({
  icon,
  title,
  subtitle,
  actions,
  background = 'gradient',
  size = 'lg',
  className = '',
}) => {
  const sizes = {
    sm: {
      padding: `${theme.spacing[12]} ${theme.spacing[6]}`,
      titleSize: theme.typography.fontSize['3xl'],
      subtitleSize: theme.typography.fontSize.base,
    },
    md: {
      padding: `${theme.spacing[16]} ${theme.spacing[6]}`,
      titleSize: theme.typography.fontSize['4xl'],
      subtitleSize: theme.typography.fontSize.lg,
    },
    lg: {
      padding: `${theme.spacing[20]} ${theme.spacing[6]}`,
      titleSize: theme.typography.fontSize['5xl'],
      subtitleSize: theme.typography.fontSize.xl,
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
    overflow: 'hidden',
  };

  const contentStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
  };

  const iconWrapperStyles: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: theme.borderRadius.xl,
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[5],
    fontSize: '2.5rem',
    color: theme.colors.text.inverse,
    boxShadow: theme.shadows.xl,
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizes[size].titleSize,
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[4],
    lineHeight: theme.typography.lineHeight.tight,
  };

  const subtitleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: sizes[size].subtitleSize,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: actions ? theme.spacing[8] : 0,
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  return (
    <section className={`hero ${className}`} style={heroStyles}>
      <GlowingOrb top="-30%" right="-10%" size={700} opacity={0.2} />
      <GlowingOrb bottom="-40%" left="-15%" size={800} color="rgba(236, 72, 153, 0.3)" opacity={0.15} />
      
      <Container maxWidth="lg">
        <div style={contentStyles}>
          {icon && <div style={iconWrapperStyles}>{icon}</div>}
          <h1 style={titleStyles}>{title}</h1>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          {actions && <div style={{ display: 'flex', gap: theme.spacing[4], justifyContent: 'center', flexWrap: 'wrap' }}>{actions}</div>}
        </div>
      </Container>
    </section>
  );
};

export default Hero;

