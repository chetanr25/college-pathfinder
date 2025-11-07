import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, TextField, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { Send, Code as CodeIcon } from '@mui/icons-material';
import CollegeCodeLookup from './CollegeCodeLookup';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K to open modal
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCodeSelect = (code: string) => {
    // Auto-paste code to input field
    setMessage((prev) => (prev ? `${prev} ${code}` : code));
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          padding: '20px',
          background: 'transparent',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        {/* College Code Lookup Button */}
        <Tooltip title="College Code Lookup (Ctrl+K)" arrow>
          <IconButton
            onClick={() => setIsModalOpen(true)}
            disabled={disabled}
            sx={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: disabled ? '#e5e7eb' : '#ffffff',
              color: disabled ? '#9ca3af' : '#667eea',
              border: '2px solid',
              borderColor: disabled ? '#e5e7eb' : '#667eea',
              boxShadow: disabled ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: disabled ? '#e5e7eb' : '#667eea',
                color: disabled ? '#9ca3af' : '#ffffff',
                transform: disabled ? 'none' : 'scale(1.05)',
                boxShadow: disabled ? 'none' : '0 6px 16px rgba(102, 126, 234, 0.3)',
              },
              '&:active': {
                transform: disabled ? 'none' : 'scale(0.95)',
              },
              '&.Mui-disabled': {
                background: '#e5e7eb',
                color: '#9ca3af',
                borderColor: '#e5e7eb',
              },
            }}
          >
            <CodeIcon />
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            position: 'relative',
            flex: 1,
            borderRadius: '32px',
            background: '#ffffff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-2px)',
            },
            '&:focus-within': {
              boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1), 0 12px 40px rgba(79, 70, 229, 0.2)',
              border: '1px solid #4F46E5',
              transform: 'translateY(-2px)',
            },
          }}
        >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              backgroundColor: 'transparent',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontSize: '15px',
              padding: '14px 20px',
              color: '#1f2937',
              '&::placeholder': {
                color: '#9ca3af',
                opacity: 1,
              },
            },
          }}
        />
      </Box>
      <IconButton
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        sx={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: disabled || !message.trim()
            ? '#e5e7eb'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: '#ffffff',
          boxShadow: disabled || !message.trim()
            ? 'none'
            : '0 8px 24px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0.7)',
          position: 'relative',
          overflow: 'visible',
          '&::before': disabled || !message.trim() ? {} : {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: -1,
            filter: 'blur(8px)',
          },
          '&:hover': {
            background: disabled || !message.trim()
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            transform: disabled || !message.trim() ? 'none' : 'scale(1.05)',
            boxShadow: disabled || !message.trim()
              ? 'none'
              : '0 12px 32px rgba(102, 126, 234, 0.5), 0 0 0 0 rgba(102, 126, 234, 0.7)',
            '&::before': {
              opacity: 0.6,
            },
          },
          '&:active': {
            transform: disabled || !message.trim() ? 'none' : 'scale(0.95)',
          },
          '&.Mui-disabled': {
            background: '#e5e7eb',
            color: '#9ca3af',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: disabled || !message.trim() ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            },
            '50%': {
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3)',
            },
          },
        }}
      >
        {disabled ? <CircularProgress size={24} sx={{ color: '#9ca3af' }} /> : <Send />}
      </IconButton>
      </Box>

      {/* College Code Lookup Modal */}
      <CollegeCodeLookup
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCodeSelect={handleCodeSelect}
      />
    </>
  );
};

export default ChatInput;
