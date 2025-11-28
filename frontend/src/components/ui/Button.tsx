import React from 'react';
import theme from '../../theme';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
}) => {
  const getButtonStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing[2],
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      width: fullWidth ? '100%' : 'auto',
      fontFamily: theme.typography.fontFamily.primary,
      ...style,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        fontSize: theme.typography.fontSize.sm,
      },
      md: {
        padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
        fontSize: theme.typography.fontSize.base,
      },
      lg: {
        padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
        fontSize: theme.typography.fontSize.lg,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        background: theme.colors.primary.gradient,
        color: theme.colors.text.inverse,
        boxShadow: theme.shadows.lg,
      },
      secondary: {
        background: theme.colors.secondary.gradient,
        color: theme.colors.text.inverse,
        boxShadow: theme.shadows.lg,
      },
      outline: {
        background: 'transparent',
        color: theme.colors.primary.main,
        border: `2px solid ${theme.colors.primary.main}`,
        boxShadow: 'none',
      },
      ghost: {
        background: 'rgba(79, 70, 229, 0.1)',
        color: theme.colors.primary.main,
        boxShadow: 'none',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty('--mouse-x', `${x}px`);
    button.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      className={`custom-button ${className}`}
      style={getButtonStyles()}
    >
      {icon && iconPosition === 'left' && <span style={styles.icon}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span style={styles.icon}>{icon}</span>}
      <span style={styles.ripple}></span>
    </button>
  );
};

const styles = {
  icon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25em',
  },
  ripple: {
    position: 'absolute' as const,
    top: 'var(--mouse-y, 50%)',
    left: 'var(--mouse-x, 50%)',
    width: '0',
    height: '0',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.5)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none' as const,
  },
};

export default Button;

