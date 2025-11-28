import React, { useEffect, useState } from 'react';
import theme from '../../theme';

export interface AnimatedTextProps {
  children: string;
  variant?: 'gradient' | 'glow' | 'typewriter';
  gradient?: string;
  size?: keyof typeof theme.typography.fontSize;
  weight?: keyof typeof theme.typography.fontWeight;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  variant = 'gradient',
  gradient = theme.colors.primary.gradient,
  size = '4xl',
  weight = 'bold',
  className = '',
  style = {},
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (variant === 'typewriter' && currentIndex < children.length) {
      const timeout = setTimeout(() => {
        setDisplayText(children.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, children, variant]);

  const getTextStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontSize: theme.typography.fontSize[size],
      fontWeight: theme.typography.fontWeight[weight],
      fontFamily: theme.typography.fontFamily.heading,
      margin: 0,
      lineHeight: theme.typography.lineHeight.tight,
      ...style,
    };

    const variantStyles = {
      gradient: {
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      },
      glow: {
        color: theme.colors.text.primary,
        textShadow: `0 0 20px rgba(79, 70, 229, 0.5), 0 0 40px rgba(79, 70, 229, 0.3)`,
      },
      typewriter: {
        color: theme.colors.text.primary,
      },
    };

    return {
      ...baseStyles,
      ...variantStyles[variant],
    };
  };

  return (
    <h1 className={`animated-text ${className}`} style={getTextStyles()}>
      {variant === 'typewriter' ? displayText : children}
      {variant === 'typewriter' && currentIndex < children.length && (
        <span
          style={{
            borderRight: '2px solid',
            animation: 'blink 1s infinite',
            marginLeft: '2px',
          }}
        />
      )}
    </h1>
  );
};

export default AnimatedText;

