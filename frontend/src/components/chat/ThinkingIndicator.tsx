import React, { useEffect, useState } from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { 
  AutoAwesome, 
  CheckCircle, 
  Search, 
  School, 
  TrendingUp, 
  Email, 
  CompareArrows, 
  Psychology,
  DataObject,
  Stars
} from '@mui/icons-material';

interface ThinkingIndicatorProps {
  steps: Array<{
    step: string;
    timestamp: string;
    completed?: boolean;
  }>;
}

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(124, 58, 237, 0.3), 0 0 10px rgba(124, 58, 237, 0.2); 
  }
  50% { 
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.5), 0 0 25px rgba(124, 58, 237, 0.3); 
  }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
`;

// Get icon based on step content
const getStepIcon = (step: string, completed: boolean) => {
  const iconProps = {
    sx: {
      fontSize: '18px',
      color: completed ? '#10b981' : '#8b5cf6',
      animation: completed ? 'none' : `${spin} 2s linear infinite`,
    }
  };

  if (step.includes('Understanding') || step.includes('💭')) {
    return <Psychology {...iconProps} />;
  }
  if (step.includes('Search') || step.includes('🔍') || step.includes('🔎')) {
    return <Search {...iconProps} />;
  }
  if (step.includes('college') || step.includes('🏫') || step.includes('🎓')) {
    return <School {...iconProps} />;
  }
  if (step.includes('trend') || step.includes('📊') || step.includes('📈')) {
    return <TrendingUp {...iconProps} />;
  }
  if (step.includes('email') || step.includes('📧')) {
    return <Email {...iconProps} />;
  }
  if (step.includes('Compar') || step.includes('⚖️')) {
    return <CompareArrows {...iconProps} />;
  }
  if (step.includes('Preparing') || step.includes('✨')) {
    return <Stars {...iconProps} />;
  }
  if (step.includes('✅')) {
    return <CheckCircle sx={{ fontSize: '18px', color: '#10b981' }} />;
  }
  return <DataObject {...iconProps} />;
};

// Loading dots component
const LoadingDots = () => (
  <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', ml: 1 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#8b5cf6',
          animation: `${dotPulse} 1.4s ease-in-out infinite`,
          animationDelay: `${i * 0.16}s`,
        }}
      />
    ))}
  </Box>
);

// Brain animation component
const ThinkingBrain = () => {
  const [frame, setFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const brainFrames = ['🧠', '💡', '✨'];
  
  return (
    <Box
      sx={{
        fontSize: '28px',
        animation: `${pulse} 1.5s ease-in-out infinite`,
        filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))',
      }}
    >
      {brainFrames[frame]}
    </Box>
  );
};

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ steps }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(t => t + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (steps.length === 0) return null;

  const completedSteps = steps.filter(s => s.completed || s.step.includes('✅')).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / Math.max(totalSteps, 1)) * 100 : 0;

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(167, 139, 250, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
        animation: `${glow} 2s ease-in-out infinite`,
      }}
    >
      {/* Shimmer overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 2s linear infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThinkingBrain />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.3px',
                }}
              >
                AI is working
              </Typography>
              <LoadingDots />
            </Box>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#8b5cf6',
                marginTop: '2px',
              }}
            >
              {elapsedTime.toFixed(1)}s elapsed
            </Typography>
          </Box>
        </Box>

        {/* Progress indicator */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          background: 'rgba(139, 92, 246, 0.15)',
          padding: '6px 12px',
          borderRadius: '20px',
        }}>
          <AutoAwesome sx={{ fontSize: '16px', color: '#8b5cf6', animation: `${spin} 3s linear infinite` }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#7c3aed' }}>
            {completedSteps}/{totalSteps} steps
          </Typography>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box sx={{ 
        width: '100%', 
        height: '4px', 
        background: 'rgba(139, 92, 246, 0.2)',
        borderRadius: '2px',
        marginBottom: '16px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{
          height: '100%',
          background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)',
          borderRadius: '2px',
          width: `${progress}%`,
          transition: 'width 0.3s ease',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: `${shimmer} 1.5s linear infinite`,
          }
        }} />
      </Box>

      {/* Steps timeline */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        position: 'relative',
        zIndex: 1,
      }}>
        {steps.map((step, index) => {
          const isCompleted = step.completed || step.step.includes('✅');
          const isLatest = index === steps.length - 1 && !isCompleted;
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: `${fadeInUp} 0.3s ease-out`,
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards',
                position: 'relative',
              }}
            >
              {/* Timeline line */}
              {index < steps.length - 1 && (
                <Box sx={{
                  position: 'absolute',
                  left: '15px',
                  top: '32px',
                  width: '2px',
                  height: 'calc(100% + 4px)',
                  background: isCompleted 
                    ? 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.3) 100%)'
                    : 'linear-gradient(180deg, #8b5cf6 0%, rgba(139, 92, 246, 0.3) 100%)',
                  borderRadius: '1px',
                }} />
              )}

              {/* Step icon */}
              <Box
                sx={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isCompleted 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : isLatest
                    ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.1) 100%)',
                  border: isCompleted 
                    ? '2px solid rgba(16, 185, 129, 0.4)'
                    : isLatest
                    ? '2px solid rgba(124, 58, 237, 0.5)'
                    : '2px solid rgba(139, 92, 246, 0.25)',
                  boxShadow: isLatest ? '0 0 12px rgba(124, 58, 237, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted ? (
                  <CheckCircle sx={{ fontSize: '18px', color: '#10b981' }} />
                ) : (
                  getStepIcon(step.step, isCompleted)
                )}
              </Box>

              {/* Step content */}
              <Box sx={{ flex: 1, minWidth: 0, pt: '4px' }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: isCompleted ? '#059669' : isLatest ? '#5b21b6' : '#6b21a8',
                    fontWeight: isLatest ? 600 : 500,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {step.step.replace(/^(💭|🔍|🔎|📚|🏫|📊|📈|🎓|⚖️|📧|🔧|✅|✨)\s*/, '')}
                </Typography>
                {isLatest && !isCompleted && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginTop: '4px',
                  }}>
                    <Box sx={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      animation: `${pulse} 1s ease-in-out infinite`,
                    }} />
                    <Typography sx={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 500 }}>
                      In progress...
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
    </Box>
  );
};

export default ThinkingIndicator;
