import React from 'react';
import { Card } from './';
import theme from '../../theme';

export interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  items: string[];
  variant?: 'elevated' | 'outlined' | 'glass';
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  items,
  variant = 'elevated',
}) => {
  return (
    <Card variant={variant}>
      {icon && (
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: theme.borderRadius.xl,
            background: theme.colors.primary.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing[4],
            fontSize: '1.75rem',
            color: theme.colors.text.inverse,
            boxShadow: theme.shadows.lg,
          }}
        >
          {icon}
        </div>
      )}
      
      <h3
        style={{
          margin: 0,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[4],
        }}
      >
        {title}
      </h3>
      
      <ul
        style={{
          margin: 0,
          paddingLeft: theme.spacing[6],
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.secondary,
          lineHeight: theme.typography.lineHeight.relaxed,
        }}
      >
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: theme.spacing[2] }}>
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default InfoCard;

