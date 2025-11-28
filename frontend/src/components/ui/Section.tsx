import React from 'react';
import theme from '../../theme';

export interface SectionProps {
  children: React.ReactNode;
  background?: 'default' | 'paper' | 'gradient' | 'mesh' | string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

const Section: React.FC<SectionProps> = ({
  children,
  background = 'default',
  padding = 'lg',
  className = '',
  style = {},
}) => {
  const backgrounds = {
    default: theme.colors.background.default,
    paper: theme.colors.background.paper,
    gradient: theme.colors.primary.gradient,
    mesh: theme.colors.background.mesh,
  };

  const paddings = {
    sm: `${theme.spacing[8]} 0`,
    md: `${theme.spacing[12]} 0`,
    lg: `${theme.spacing[16]} 0`,
    xl: `${theme.spacing[20]} 0`,
  };

  const sectionStyles: React.CSSProperties = {
    background: backgrounds[background as keyof typeof backgrounds] || background,
    padding: paddings[padding],
    ...style,
  };

  return (
    <section className={`section ${className}`} style={sectionStyles}>
      {children}
    </section>
  );
};

export default Section;

