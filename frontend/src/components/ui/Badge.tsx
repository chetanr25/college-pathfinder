import React from 'react';
import theme from '../../theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  gradient = false,
  className = '',
  style = {},
}) => {
  const sizeStyles = {
    sm: {
      padding: `2px ${theme.spacing[2]}`,
      fontSize: '0.65rem',
    },
    md: {
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.xs,
    },
    lg: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
  };

  const variantStyles = {
    primary: {
      background: gradient ? theme.colors.primary.gradient : theme.colors.primary.main,
      color: theme.colors.text.inverse,
    },
    secondary: {
      background: gradient ? theme.colors.secondary.gradient : theme.colors.secondary.main,
      color: theme.colors.text.inverse,
    },
    success: {
      background: theme.colors.success.bg,
      color: theme.colors.success.dark,
    },
    warning: {
      background: theme.colors.warning.bg,
      color: theme.colors.warning.dark,
    },
    error: {
      background: theme.colors.error.bg,
      color: theme.colors.error.dark,
    },
    info: {
      background: theme.colors.info.bg,
      color: theme.colors.info.dark,
    },
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
    transition: theme.transitions.base,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <span className={`badge ${className}`} style={badgeStyles}>
      {children}
    </span>
  );
};

export default Badge;

