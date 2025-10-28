import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';

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

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        background: '#ffffff',
        alignItems: 'flex-end',
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
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4F46E5',
              borderWidth: '2px',
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '14px',
            padding: '12px 14px',
          },
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        sx={{
          width: '48px',
          height: '48px',
          background: disabled || !message.trim()
            ? '#e5e7eb'
            : 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
          color: '#ffffff',
          '&:hover': {
            background: disabled || !message.trim()
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
            opacity: 0.9,
          },
          '&.Mui-disabled': {
            background: '#e5e7eb',
            color: '#9ca3af',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {disabled ? <CircularProgress size={20} sx={{ color: '#9ca3af' }} /> : <Send />}
      </IconButton>
    </Box>
  );
};

export default ChatInput;
