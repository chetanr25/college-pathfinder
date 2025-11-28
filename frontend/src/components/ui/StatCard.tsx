import React from 'react';
import { Card } from './';
import theme from '../../theme';

export interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  gradient?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = theme.colors.primary.main,
  gradient = theme.colors.primary.gradient,
  trend,
}) => {
  return (
    <Card variant="elevated" hoverable style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', color, marginBottom: theme.spacing[3] }}>
        {icon}
      </div>
      
      <div
        style={{
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.bold,
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: theme.spacing[2],
        }}
      >
        {value}
      </div>
      
      <div
        style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.secondary,
          fontWeight: theme.typography.fontWeight.medium,
        }}
      >
        {label}
      </div>
      
      {trend && (
        <div
          style={{
            marginTop: theme.spacing[2],
            fontSize: theme.typography.fontSize.sm,
            color: trend.isPositive ? theme.colors.success.main : theme.colors.error.main,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
};

export default StatCard;

