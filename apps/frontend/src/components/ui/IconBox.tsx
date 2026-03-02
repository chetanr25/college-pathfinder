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
      width: '40px',
      height: '40px',
      fontSize: '1.25rem',
      borderRadius: '10px',
    },
    md: {
      width: '52px',
      height: '52px',
      fontSize: '1.5rem',
      borderRadius: '12px',
    },
    lg: {
      width: '64px',
      height: '64px',
      fontSize: '2rem',
      borderRadius: '14px',
    },
    xl: {
      width: '80px',
      height: '80px',
      fontSize: '2.5rem',
      borderRadius: '18px',
    },
  };

  const sizeConfig = sizes[size];
  const iconBoxStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeConfig.width,
    height: sizeConfig.height,
    fontSize: sizeConfig.fontSize,
    borderRadius: sizeConfig.borderRadius,
    background: gradient,
    color: theme.colors.text.inverse,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    ...style,
  };

  return (
    <div className={`icon-box ${className}`} style={iconBoxStyles}>
      {children}
    </div>
  );
};

export default IconBox;

