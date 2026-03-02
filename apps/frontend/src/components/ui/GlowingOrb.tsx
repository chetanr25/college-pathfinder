import React from 'react';

export interface GlowingOrbProps {
  size?: number;
  color?: string;
  blur?: number;
  opacity?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  className?: string;
}

const GlowingOrb: React.FC<GlowingOrbProps> = ({
  size = 600,
  color = 'rgba(79, 70, 229, 0.3)',
  blur = 100,
  opacity = 0.3,
  top,
  left,
  right,
  bottom,
  className = '',
}) => {
  const orbStyles: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: 'none',
    top,
    left,
    right,
    bottom,
    animation: 'float 20s ease-in-out infinite',
  };

  return <div className={`glowing-orb ${className}`} style={orbStyles} />;
};

export default GlowingOrb;

