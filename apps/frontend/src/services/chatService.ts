/**
 * Chat Service — Backend REST API Integration
 * Replaces Supabase direct access; all data goes through the FastAPI backend.
 */
import axios from 'axios';

const getToken = (): string => localStorage.getItem('auth_token') ?? '';

const _api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005' });
_api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ChatMessage {
  timestamp: string | number | Date;
  id?: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  message_id?: string; // For WebSocket messages that haven't been saved yet
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

class ChatService {
  /**
   * Create a new chat session
   */
  async createSession(userId: string, title: string = 'New Chat'): Promise<ChatSession | null> {
    try {
      const { data } = await _api.post('/chat/sessions', null, {
        params: { user_id: userId, title },
      });
      return {
        id: data.session_id,
        user_id: userId,
        title,
        preview: '',
        created_at: data.created_at,
        updated_at: data.created_at,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data } = await _api.get('/chat/sessions', { params: { user_id: userId } });
      return (data.sessions ?? []).map((s: any) => ({
        id: s.session_id,
        user_id: userId,
        title: s.title,
        preview: s.preview,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  /**
   * Get a specific session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data } = await _api.get(`/chat/sessions/${sessionId}`);
      return {
        id: data.session_id,
        user_id: '',
        title: data.title,
        preview: data.preview,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Update session title and preview
   */
  async updateSession(sessionId: string, updates: { title?: string; preview?: string }): Promise<boolean> {
    try {
      await _api.patch(`/chat/sessions/${sessionId}`, null, {
        params: { title: updates.title },
      });
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  /**
   * Delete a chat session and its messages
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await _api.delete(`/chat/sessions/${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Get messages for a session
   */
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data } = await _api.get(`/chat/sessions/${sessionId}/messages`);
      return (data.messages ?? [])
        .filter((m: any) => m.role !== 'thinking')
        .map((m: any) => ({
          id: m.message_id,
          session_id: sessionId,
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          created_at: m.timestamp,
          timestamp: m.timestamp,
        }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Save a message. Backend persists messages via WebSocket/SSE;
   * this returns a local object to keep UI state consistent.
   */
  async saveMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage | null> {
    const now = new Date().toISOString();
    return { session_id: sessionId, role, content, created_at: now, timestamp: now };
  }

  /**
   * Generate session title from first message
   */
  async generateTitle(sessionId: string, firstMessage: string): Promise<void> {
    const title = firstMessage.length > 40
      ? firstMessage.substring(0, 40) + '...'
      : firstMessage;
    await this.updateSession(sessionId, { title });
  }

  /**
   * Get WebSocket URL for chat
   */
  getWebSocketUrl(sessionId: string, accessToken: string): string {
    const wsBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005').replace(/^http/, 'ws');
    return `${wsBase}/ws/chat/${sessionId}?token=${accessToken}`;
  }

  /**
   * Check if a session has messages
   */
  async hasMessages(sessionId: string): Promise<boolean> {
    try {
      const { data } = await _api.get(`/chat/sessions/${sessionId}/messages`, {
        params: { limit: 1 },
      });
      return (data.message_count ?? 0) > 0;
    } catch (error) {
      console.error('Error checking messages:', error);
      return false;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
