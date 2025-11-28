import React from 'react';
import theme from '../../theme';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  className = '',
  style = {},
}) => {
  const maxWidths = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidths[maxWidth],
    margin: '0 auto',
    padding: padding ? `0 ${theme.spacing[6]}` : '0',
    ...style,
  };

  return (
    <div className={`container ${className}`} style={containerStyles}>
      {children}
    </div>
  );
};

export default Container;

