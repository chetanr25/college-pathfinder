import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';
import type { ChatMessage as ChatMessageType } from '../../services/chatService';
import TableMessage from './TableMessage';
import {
  splitContentWithTables,
  parseMarkdownTable,
  getHighlightRules,
} from '../../utils/tableParser';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            color: '#9ca3af',
            fontStyle: 'italic',
          }}
        >
          {message.content}
        </Typography>
      </Box>
    );
  }

  // Parse content for tables
  const contentParts = splitContentWithTables(message.content);
  const hasTables = contentParts.some((part) => part.type === 'table');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: '16px',
        gap: '12px',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          background: isUser
            ? 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          flexShrink: 0,
        }}
      >
        {isUser ? <Person sx={{ fontSize: '20px' }} /> : <SmartToy sx={{ fontSize: '20px' }} />}
      </Avatar>

      {/* Message Content Container */}
      <Box
        sx={{
          maxWidth: hasTables && !isUser ? '90%' : '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {contentParts.map((part, index) => {
          if (part.type === 'table' && !isUser) {
            // Render table using TableMessage component
            const parsedTable = parseMarkdownTable(part.content);
            if (parsedTable) {
              const highlightRules = getHighlightRules(parsedTable.columns);
              return (
                <TableMessage
                  key={index}
                  title={parsedTable.title}
                  columns={parsedTable.columns}
                  rows={parsedTable.rows}
                  highlightRules={highlightRules}
                />
              );
            }
          }

          // Render text content
          return (
            <Box
              key={index}
              sx={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: isUser
                  ? 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)'
                  : '#ffffff',
                color: isUser ? '#ffffff' : '#1a1a1a',
                boxShadow: isUser
                  ? '0 4px 12px rgba(250, 139, 255, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: isUser ? 'none' : '1px solid #e5e7eb',
                wordBreak: 'break-word',
              }}
            >
              {/* Message Content */}
              <Box
                sx={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  '& p': {
                    margin: 0,
                    marginBottom: '0.5em',
                    '&:last-child': {
                      marginBottom: 0,
                    },
                  },
                  '& h1, & h2, & h3': {
                    marginTop: '0.5em',
                    marginBottom: '0.5em',
                    fontWeight: 600,
                  },
                  '& h1': { fontSize: '1.5em' },
                  '& h2': { fontSize: '1.3em' },
                  '& h3': { fontSize: '1.1em' },
                  '& ul, & ol': {
                    marginLeft: '1.5em',
                    marginBottom: '0.5em',
                  },
                  '& li': {
                    marginBottom: '0.2em',
                  },
                  '& code': {
                    background: isUser ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    fontFamily: 'monospace',
                  },
                  '& strong': {
                    fontWeight: 600,
                  },
                  '& a': {
                    color: isUser ? '#fff' : '#4F46E5',
                    textDecoration: 'underline',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: formatMessage(part.content) }}
              />

              {/* Timestamp (only on last part) */}
              {index === contentParts.length - 1 && (
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af',
                    marginTop: '6px',
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Simple markdown-like formatting
function formatMessage(content: string): string {
  let formatted = content;

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Headings
  formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Lists
  formatted = formatted.replace(/^\- (.*$)/gim, '<li>$1</li>');
  formatted = formatted.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

  // Wrap consecutive <li> in <ul>
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  if (!formatted.startsWith('<')) {
    formatted = '<p>' + formatted + '</p>';
  }

  // Clean up
  formatted = formatted.replace(/<p><h/g, '<h');
  formatted = formatted.replace(/<\/h(\d)><\/p>/g, '</h$1>');
  formatted = formatted.replace(/<p><ul>/g, '<ul>');
  formatted = formatted.replace(/<\/ul><\/p>/g, '</ul>');

  return formatted;
}

export default ChatMessage;
