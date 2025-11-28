import React from 'react';
import theme from '../../theme';

export interface GridProps {
  children: React.ReactNode;
  columns?: number | 'auto';
  gap?: keyof typeof theme.spacing;
  minItemWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Grid: React.FC<GridProps> = ({
  children,
  columns = 'auto',
  gap = 6,
  minItemWidth = '300px',
  className = '',
  style = {},
}) => {
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns:
      columns === 'auto' ? `repeat(auto-fill, minmax(${minItemWidth}, 1fr))` : `repeat(${columns}, 1fr)`,
    gap: theme.spacing[gap],
    ...style,
  };

  return (
    <div className={`grid ${className}`} style={gridStyles}>
      {children}
    </div>
  );
};

export default Grid;

