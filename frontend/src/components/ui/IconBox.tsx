import React from 'react';
import theme from '../../theme';

export interface IconBoxProps {
  children: React.ReactNode;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

const IconBox: React.FC<IconBoxProps> = ({
  children,
  gradient = theme.colors.primary.gradient,
  size = 'md',
  className = '',
  style = {},
}) => {
  const sizes = {
    sm: {
      width: '48px',
      height: '48px',
      fontSize: '1.5rem',
    },
    md: {
      width: '64px',
      height: '64px',
      fontSize: '2rem',
    },
    lg: {
      width: '80px',
      height: '80px',
      fontSize: '2.5rem',
    },
    xl: {
      width: '96px',
      height: '96px',
      fontSize: '3rem',
    },
  };

  const iconBoxStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.xl,
    background: gradient,
    color: theme.colors.text.inverse,
    boxShadow: theme.shadows.lg,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...sizes[size],
    ...style,
  };

  return (
    <div className={`icon-box ${className}`} style={iconBoxStyles}>
      {children}
    </div>
  );
};

export default IconBox;

