import React, { useState } from 'react';
import theme from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'glass';
  hoverable?: boolean;
  glow?: boolean;
  gradient?: string;
  onClick?: () => void;
  padding?: keyof typeof theme.spacing;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  hoverable = false,
  glow = false,
  gradient,
  onClick,
  padding = 6,
  className = '',
  style = {},
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[padding],
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    const variantStyles = {
      elevated: {
        background: theme.colors.background.paper,
        boxShadow: theme.shadows.md,
        border: `1px solid ${theme.colors.border.light}`,
      },
      outlined: {
        background: theme.colors.background.paper,
        border: `2px solid ${theme.colors.border.main}`,
        boxShadow: 'none',
      },
      glass: {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
    };

    const hoverStyles = hoverable
      ? {
          transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) / 40}deg) rotateY(${(mousePosition.x - 50) / 40}deg) translateZ(5px)`,
        }
      : {};

    return {
      ...baseStyles,
      ...variantStyles[variant],
      ...hoverStyles,
    };
  };

  return (
    <div
      className={`custom-card ${className}`}
      style={getCardStyles()}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 50, y: 50 })}
    >
      {gradient && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: gradient,
            borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
          }}
        />
      )}
      {glow && (
        <div
          style={{
            position: 'absolute',
            top: `${mousePosition.y}%`,
            left: `${mousePosition.x}%`,
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default Card;

