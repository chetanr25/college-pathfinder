// import React, { useState, useEffect, useRef } from 'react';
// import { Box, Container, Typography, Paper, Alert } from '@mui/material';
// import { SmartToy } from '@mui/icons-material';
// import { ChatService, chatApi } from '../services/chatService';
// import type { ChatMessage as ChatMessageType } from '../services/chatService';
// import ChatMessage from '../components/chat/ChatMessage';
// import ChatInput from '../components/chat/ChatInput';
// import ThinkingIndicator from '../components/chat/ThinkingIndicator';
// import theme from '../theme';

// const AIChat: React.FC = () => {
//   const [messages, setMessages] = useState<ChatMessageType[]>([]);
//   const [thinkingSteps, setThinkingSteps] = useState<Array<{ step: string; timestamp: string; completed?: boolean }>>([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState<string>('');
//   const chatServiceRef = useRef<ChatService | null>(null); // Use ref instead of state
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const isInitializedRef = useRef(false); // Prevent double initialization

//   // Auto-scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, thinkingSteps]);

//   // Initialize chat session - runs only once
//   useEffect(() => {
//     // Prevent double initialization (React StrictMode in dev runs effects twice)
//     if (isInitializedRef.current) {
//       console.log('🛑 Already initialized, skipping...');
//       return;
//     }
    
//     console.log('🚀 Initializing chat...');
//     isInitializedRef.current = true;

//     const initializeChat = async () => {
//       try {
//         console.log('📞 Creating session...');
//         const session = await chatApi.createSession();
//         console.log('✅ Session created:', session.session_id);

//         // Create chat service
//         const service = new ChatService(session.session_id);
//         chatServiceRef.current = service;

//         // Connect to WebSocket
//         console.log('🔌 Connecting to WebSocket...');
//         await service.connect();
//         console.log('✅ WebSocket connected');

//         // Set up message handlers
//         service.onMessage((type, message) => {
//           console.log('📨 Received message:', type, message);
          
//           switch (type) {
//             case 'welcome':
//               console.log('👋 Welcome message received');
//               setMessages([{
//                 message_id: 'welcome',
//                 role: 'assistant',
//                 content: message.message,
//                 timestamp: new Date().toISOString(),
//               }]);
//               setIsConnected(true);
//               console.log('✅ isConnected set to true');
//               break;

//             case 'thinking':
//               setThinkingSteps(prev => [...prev, { step: message.step, timestamp: message.timestamp }]);
//               break;

//             case 'tool_call':
//               if (message.status === 'completed') {
//                 setThinkingSteps(prev => 
//                   prev.map((s, i) => i === prev.length - 1 ? { ...s, completed: true } : s)
//                 );
//               }
//               break;

//             case 'response_chunk':
//               // Accumulate chunks
//               setMessages(prev => {
//                 const lastMessage = prev[prev.length - 1];
//                 if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.message_id.startsWith('final-')) {
//                   return [
//                     ...prev.slice(0, -1),
//                     { ...lastMessage, content: lastMessage.content + message.content }
//                   ];
//                 } else {
//                   return [
//                     ...prev,
//                     {
//                       message_id: 'streaming',
//                       role: 'assistant',
//                       content: message.content,
//                       timestamp: new Date().toISOString(),
//                     }
//                   ];
//                 }
//               });
//               break;

//             case 'response_complete':
//               setThinkingSteps([]);
//               setIsProcessing(false);
//               // Update final message with proper ID
//               setMessages(prev => {
//                 const lastMessage = prev[prev.length - 1];
//                 if (lastMessage && lastMessage.message_id === 'streaming') {
//                   return [
//                     ...prev.slice(0, -1),
//                     { ...lastMessage, message_id: 'final-' + message.message_id, content: message.full_content }
//                   ];
//                 }
//                 return prev;
//               });
//               break;

//             case 'error':
//               setError(message.message || 'An error occurred');
//               setIsProcessing(false);
//               setThinkingSteps([]);
//               break;

//             case 'history':
//               setMessages(message.messages);
//               break;
//           }
//         });

//       } catch (err) {
//         console.error('❌ Chat initialization error:', err);
//         setError('Failed to initialize chat. Please refresh the page.');
//         setIsConnected(false);
//       }
//     };

//     initializeChat();

//     // Cleanup function
//     return () => {
//       console.log('🧹 Cleaning up chat service...');
//       if (chatServiceRef.current) {
//         chatServiceRef.current.disconnect();
//         chatServiceRef.current = null;
//       }
//     };
//   }, []); // Empty deps - run only once

//   const handleSendMessage = (message: string) => {
//     const service = chatServiceRef.current;
//     if (!service || isProcessing) return;

//     try {
//       // Add user message to UI
//       const userMessage: ChatMessageType = {
//         message_id: `user-${Date.now()}`,
//         role: 'user',
//         content: message,
//         timestamp: new Date().toISOString(),
//       };
//       setMessages(prev => [...prev, userMessage]);

//       // Send to backend
//       service.sendMessage(message);
//       setIsProcessing(true);
//       setError('');
//     } catch (err) {
//       setError('Failed to send message. Please try again.');
//       console.error('Send message error:', err);
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', background: theme.colors.background.default, paddingBottom: '20px' }}>
//       {/* Header */}
//       <Box
//         sx={{
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           padding: '40px 24px',
//           marginBottom: '0',
//         }}
//       >
//         <Container maxWidth="lg">
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
//             <SmartToy sx={{ fontSize: '48px', color: '#ffffff' }} />
//             <Box>
//               <Typography
//                 sx={{
//                   fontSize: '32px',
//                   fontWeight: 700,
//                   color: '#ffffff',
//                   marginBottom: '8px',
//                 }}
//               >
//                 AI College Counselor
//               </Typography>
//               <Typography sx={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)' }}>
//                 Get personalized guidance for your KCET college admissions
//               </Typography>
//             </Box>
//           </Box>
//         </Container>
//       </Box>

//       {/* Chat Container */}
//       <Container maxWidth="lg" sx={{ marginTop: '-20px' }}>
//         <Paper
//           elevation={3}
//           sx={{
//             height: '600px',
//             display: 'flex',
//             flexDirection: 'column',
//             borderRadius: '16px',
//             overflow: 'hidden',
//             border: '1px solid #e5e7eb',
//           }}
//         >
//           {/* Messages Area */}
//           <Box
//             sx={{
//               flex: 1,
//               overflowY: 'auto',
//               padding: '24px',
//               background: '#f9fafb',
//             }}
//           >
//             {error && (
//               <Alert severity="error" sx={{ marginBottom: '16px' }}>
//                 {error}
//               </Alert>
//             )}

//             {messages.map((msg) => (
//               <ChatMessage key={msg.message_id} message={msg} />
//             ))}

//             {thinkingSteps.length > 0 && (
//               <ThinkingIndicator steps={thinkingSteps} />
//             )}

//             <div ref={messagesEndRef} />
//           </Box>

//           {/* Input Area */}
//           <ChatInput
//             onSendMessage={handleSendMessage}
//             disabled={isProcessing || !isConnected}
//             placeholder={
//               !isConnected
//                 ? 'Connecting...'
//                 : isProcessing
//                 ? 'AI is thinking...'
//                 : 'Ask me anything about KCET colleges...'
//             }
//           />
//         </Paper>

//         {/* Info Cards */}
//         <Box
//           sx={{
//             marginTop: '24px',
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//             gap: '16px',
//           }}
//         >
//           <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
//             <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
//               💡 Example Questions
//             </Typography>
//             <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
//               • "I got rank 5000, which colleges can I get?"
//               <br />
//               • "Show me computer science colleges"
//               <br />
//               • "What are the cutoff trends for Round 2?"
//             </Typography>
//           </Paper>

//           <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
//             <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
//               🎯 What I Can Do
//             </Typography>
//             <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
//               • Find colleges based on your rank
//               <br />
//               • Filter by branches and preferences
//               <br />
//               • Compare cutoffs across rounds
//               <br />
//               • Provide counselling strategy
//             </Typography>
//           </Paper>

//           <Paper sx={{ padding: '16px', borderRadius: '12px' }}>
//             <Typography sx={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#4F46E5' }}>
//               ⚡ Smart Features
//             </Typography>
//             <Typography sx={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
//               • Real-time data from KCET 2024
//               <br />
//               • Conversational memory
//               <br />
//               • Intelligent branch filtering
//               <br />
//               • Transparent thinking process
//             </Typography>
//           </Paper>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default AIChat;
