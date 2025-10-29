import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { AutoAwesome, Settings, CheckCircle } from '@mui/icons-material';

interface ThinkingIndicatorProps {
  steps: Array<{
    step: string;
    timestamp: string;
    completed?: boolean;
  }>;
}

// Animated pulse
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Spinning animation
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ steps }) => {
  if (steps.length === 0) return null;

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        border: '1px solid #e9d5ff',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <AutoAwesome 
          sx={{ 
            color: '#7c3aed',
            fontSize: '20px',
            marginRight: '8px',
            animation: `${spin} 3s linear infinite`
          }} 
        />
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#5b21b6',
            letterSpacing: '0.5px',
          }}
        >
          AI is thinking...
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              paddingLeft: '4px',
            }}
          >
            {step.completed ? (
              <CheckCircle
                sx={{
                  fontSize: '16px',
                  color: '#10b981',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
            ) : (
              <Settings
                sx={{
                  fontSize: '16px',
                  color: '#8b5cf6',
                  flexShrink: 0,
                  marginTop: '2px',
                  animation: `${spin} 2s linear infinite`,
                }}
              />
            )}
            <Typography
              sx={{
                fontSize: '13px',
                color: '#6b21a8',
                lineHeight: '1.5',
                fontWeight: step.completed ? 500 : 400,
              }}
            >
              {step.step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ThinkingIndicator;
