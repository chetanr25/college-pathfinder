import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Container, Typography, Alert, IconButton, useMediaQuery } from '@mui/material';
import { SmartToy, Menu as MenuIcon, Home, Logout } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import type { ChatMessage as ChatMessageType, ChatSession } from '../services/chatService';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import ThinkingIndicator from '../components/chat/ThinkingIndicator';
import ChatSidebar from '../components/chat/ChatSidebar';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

const AIChat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, signOut, getAccessToken } = useAuth();
  
  // State management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<Array<{ step: string; timestamp: string; completed?: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const currentSessionIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasChatStarted = messages.length > 0;

  useEffect(() => {
    setIsHeaderMinimized(hasChatStarted);
  }, [hasChatStarted]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingSteps, scrollToBottom]);

  // Load user's sessions
  const loadSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingSessions(true);
      const sessionsList = await chatService.getSessions(user.id);
      setSessions(sessionsList);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }, [user]);

  // Load sessions on mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);

  // Initialize chat - runs once when user is ready
  useEffect(() => {
    if (!user || isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    
    const sessionIdFromUrl = searchParams.get('session_id');
    
    const initChat = async () => {
      if (sessionIdFromUrl) {
        // Load existing session
        setCurrentSessionId(sessionIdFromUrl);
        currentSessionIdRef.current = sessionIdFromUrl;
        
        try {
          const history = await chatService.getMessages(sessionIdFromUrl);
          if (history.length > 0) {
            setMessages(history);
          }
        } catch (err) {
          console.error('Error loading history:', err);
        }
      } else {
        // Create new temp session
        const tempSessionId = `temp-${Date.now()}`;
        setCurrentSessionId(tempSessionId);
        currentSessionIdRef.current = tempSessionId;
        setMessages([]);
      }
    };

    initChat();
  }, [user?.id, searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Send message using HTTP streaming (SSE)
   */
  const handleSendMessage = async (message: string) => {
    if (isProcessing || !user) {
      console.log('Cannot send message:', { isProcessing, user: !!user });
      return;
    }

    try {
      let sessionId = currentSessionId;
      
      // If this is a temp session, create real session in Supabase first
      if (sessionId?.startsWith('temp-')) {
        const newSession = await chatService.createSession(user.id, message.substring(0, 40));
        if (newSession) {
          sessionId = newSession.id;
          setCurrentSessionId(sessionId);
          currentSessionIdRef.current = sessionId;
          
          // Update URL without reload
          navigate(`/ai-chat?session_id=${sessionId}`, { replace: true });
          loadSessions();
        }
      }
      
      if (!sessionId) return;

      // Save user message to Supabase
      await chatService.saveMessage(sessionId, 'user', message);
      
      // Update title if first message
      if (messages.filter(m => m.role === 'user').length === 0) {
        await chatService.generateTitle(sessionId, message);
      }

      // Add user message to UI
      const userMessage: ChatMessageType = {
        id: `user-${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => prev.filter(m => m.id !== 'welcome').concat(userMessage));
      setIsProcessing(true);
      setError('');
      setThinkingSteps([]);

      // Get auth token
      const token = getAccessToken();

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Make streaming request
      const response = await fetch(`${API_BASE_URL}/chat/stream/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let responseText = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('📨 SSE Event:', data.type);

              switch (data.type) {
                case 'session_created':
                  // Session was created on the backend, update our reference
                  if (data.session_id) {
                    setCurrentSessionId(data.session_id);
                    currentSessionIdRef.current = data.session_id;
                    navigate(`/ai-chat?session_id=${data.session_id}`, { replace: true });
                  }
                  break;

                case 'thinking':
                  setThinkingSteps(prev => [...prev, { step: data.step, timestamp: data.timestamp || new Date().toISOString() }]);
                  break;

                case 'tool_call':
                  // Tool calls mark completion of thinking steps
                  // The thinking messages (e.g. "🔍 Searching colleges...") are sent separately
                  if (data.status === 'completed' || data.status === 'failed') {
                    setThinkingSteps(prev => 
                      prev.map((s, i) => i === prev.length - 1 ? { ...s, completed: data.status === 'completed' } : s)
                    );
                  }
                  break;

                case 'chunk':
                  responseText += data.content;
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === 'streaming') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: responseText }
                      ];
                    } else {
                      return [
                        ...prev,
                        {
                          id: 'streaming',
                          session_id: sessionId!,
                          role: 'assistant',
                          content: data.content,
                          created_at: new Date().toISOString(),
                        }
                      ];
                    }
                  });
                  break;

                case 'complete':
                  setThinkingSteps([]);
                  setIsProcessing(false);
                  
                  // Save assistant message to Supabase
                  if (data.full_content && currentSessionIdRef.current) {
                    chatService.saveMessage(currentSessionIdRef.current, 'assistant', data.full_content);
                  }
                  
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.id === 'streaming') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, id: data.message_id || 'final-' + Date.now(), content: data.full_content || responseText }
                      ];
                    }
                    return prev;
                  });
                  
                  // Reload sessions list to update sidebar
                  loadSessions();
                  break;

                case 'error':
                  setError(data.message || 'An error occurred');
                  setIsProcessing(false);
                  setThinkingSteps([]);
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError, line);
            }
          }
        }
      }

      // If stream ended without complete event, finalize
      if (isProcessing) {
        setIsProcessing(false);
        setThinkingSteps([]);
      }

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        setError('Failed to send message. Please try again.');
        console.error('Send message error:', err);
      }
      setIsProcessing(false);
      setThinkingSteps([]);
    }
  };

  const handleNewChat = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset state
    isInitializedRef.current = false;
    setMessages([]);
    setCurrentSessionId(null);
    currentSessionIdRef.current = null;
    setThinkingSteps([]);
    setIsProcessing(false);
    navigate('/ai-chat', { replace: true });
    
    // Create new temp session
    const tempSessionId = `temp-${Date.now()}`;
    setCurrentSessionId(tempSessionId);
    currentSessionIdRef.current = tempSessionId;
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Load session history
    setCurrentSessionId(sessionId);
    currentSessionIdRef.current = sessionId;
    setThinkingSteps([]);
    setIsProcessing(false);
    
    try {
      const history = await chatService.getMessages(sessionId);
      setMessages(history);
    } catch (err) {
      console.error('Error loading session:', err);
      setMessages([]);
    }
    
    navigate(`/ai-chat?session_id=${sessionId}`, { replace: true });
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await chatService.deleteSession(sessionId);
      
      if (sessionId === currentSessionId) {
        handleNewChat();
      }
      
      loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete session');
    }
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await chatService.updateSession(sessionId, { title: newTitle });
      loadSessions();
    } catch (err) {
      console.error('Failed to rename session:', err);
      setError('Failed to rename session');
    }
  };

  const handleSignOut = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await signOut();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    if (!sidebarVisible) {
      setSidebarOpen(!isMobile);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden', bgcolor: '#f9fafb' }}>
      {/* Sidebar */}
      {sidebarVisible && (
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId || undefined}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          loading={loadingSessions}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onHide={() => setSidebarVisible(false)}
        />
      )}

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: isHeaderMinimized ? '12px 24px' : '32px 24px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: isHeaderMinimized ? '12px' : '16px' }}>
                {/* Menu/Show sidebar button */}
                {(isMobile || !sidebarVisible) && (
                  <IconButton
                    onClick={isMobile ? () => setSidebarOpen(true) : toggleSidebar}
                    sx={{ color: 'white', padding: '8px' }}
                    title={sidebarVisible ? 'Open sidebar' : 'Show sidebar'}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                <SmartToy sx={{ 
                  fontSize: isHeaderMinimized ? '28px' : '48px',
                  color: '#ffffff',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
                <Box>
                  <Typography
                    sx={{
                      fontSize: isHeaderMinimized ? '18px' : '32px',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: isHeaderMinimized ? '0' : '8px',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    AI College Counselor
                  </Typography>
                  {!isHeaderMinimized && (
                    <Typography sx={{ 
                      fontSize: '16px', 
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}>
                      Get personalized guidance for your college admissions
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* User info and actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {user && (
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                  }}>
                    {user.avatar_url && (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name}
                        style={{ width: 28, height: 28, borderRadius: '50%' }}
                      />
                    )}
                    <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                      {user.name}
                    </Typography>
                  </Box>
                )}
                
                {/* Back to Home Button - More prominent */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    <Home sx={{ color: 'white', fontSize: '20px' }} />
                    <Typography sx={{ 
                      color: '#fff', 
                      fontSize: '14px', 
                      fontWeight: 600,
                      display: { xs: 'none', sm: 'block' },
                    }}>
                      Home
                    </Typography>
                  </Box>
                </Link>
                
                <IconButton 
                  onClick={handleSignOut} 
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                    },
                  }} 
                  title="Sign Out"
                >
                  <Logout />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: '140px',
          }}
        >
          <Container maxWidth="xl" sx={{ paddingTop: '24px', paddingBottom: '24px' }}>
            {error && (
              <Alert severity="error" sx={{ marginBottom: '16px' }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Welcome Screen */}
            {!hasChatStarted && (
              <Box sx={styles.welcomeContainer}>
                <Typography sx={styles.welcomeTitle}>
                  👋 Welcome, {user?.name || 'there'}! Ask me anything
                </Typography>
                <Typography sx={styles.welcomeSubtitle}>
                  Try these example questions:
                </Typography>

                <Box sx={styles.exampleCards}>
                  {[
                    {
                      icon: '🎯',
                      title: 'Find Colleges',
                      question: 'I got rank 5000, which colleges can I get?',
                    },
                    {
                      icon: '💻',
                      title: 'Branch Options',
                      question: 'Show me computer science colleges',
                    },
                    {
                      icon: '📊',
                      title: 'Compare Cutoffs',
                      question: 'What are the cutoff trends for Round 2?',
                    },
                  ].map((example, index) => (
                    <Box
                      key={index}
                      sx={styles.exampleCard}
                      onClick={() => handleSendMessage(example.question)}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Typography sx={{ fontSize: '24px' }}>{example.icon}</Typography>
                          <Typography sx={styles.exampleTitle}>{example.title}</Typography>
                        </Box>
                        <Typography sx={styles.exampleQuestion}>
                          "{example.question}"
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id || msg.created_at} 
                message={msg} 
              />
            ))}

            {thinkingSteps.length > 0 && (
              <ThinkingIndicator steps={thinkingSteps} />
            )}

            <div ref={messagesEndRef} />
          </Container>
        </Box>

        {/* Floating Input */}
        <Box sx={{
          ...styles.inputContainer,
          left: sidebarVisible && !isMobile ? '280px' : 0,
        }}>
          <Container maxWidth="md" sx={{ pointerEvents: 'auto' }}>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isProcessing}
              placeholder={
                isProcessing
                  ? 'AI is thinking...'
                  : 'Ask me anything about colleges...'
              }
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  welcomeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '60px 20px',
    minHeight: '50vh',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#374151',
    textAlign: 'center',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '24px',
  },
  exampleCards: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: '16px',
    width: '100%',
    maxWidth: '900px',
  },
  exampleCard: {
    padding: '20px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    '&:hover': {
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
      transform: 'translateY(-4px)',
      borderColor: '#667eea',
    },
  },
  exampleTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  exampleQuestion: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  inputContainer: {
    position: 'fixed' as const,
    bottom: 0,
    right: 0,
    padding: '24px',
    background: 'linear-gradient(to top, rgba(249, 250, 251, 1) 0%, rgba(249, 250, 251, 0.95) 70%, transparent 100%)',
    pointerEvents: 'none' as const,
    zIndex: 100,
    transition: 'left 0.3s ease',
  },
};

export default AIChat;
