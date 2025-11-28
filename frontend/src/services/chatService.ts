/**
 * Chat Service - Supabase Integration
 * Handles all chat session and message operations
 */
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id?: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

class ChatService {
  /**
   * Create a new chat session
   */
  async createSession(userId: string, title: string = 'New Chat'): Promise<ChatSession | null> {
      try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
          preview: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      return data;
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
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return data || [];
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
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return data;
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
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
      })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        return false;
      }

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
      // First delete all messages in the session
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionId);

      // Then delete the session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }

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
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Save a message to a session
   */
  async saveMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      // Update session preview and timestamp
      const preview = role === 'user' ? content.substring(0, 100) : undefined;
      if (preview) {
        await this.updateSession(sessionId, { preview });
      } else {
        await this.updateSession(sessionId, {});
      }

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  /**
   * Generate session title from first message
   */
  async generateTitle(sessionId: string, firstMessage: string): Promise<void> {
    // Create a short title from the first message
    const title = firstMessage.length > 40 
      ? firstMessage.substring(0, 40) + '...'
      : firstMessage;
    
    await this.updateSession(sessionId, { title, preview: firstMessage.substring(0, 100) });
    }

  /**
   * Get WebSocket URL for chat
   */
  getWebSocketUrl(sessionId: string, accessToken: string): string {
    const wsBase = API_BASE_URL.replace('http', 'ws');
    return `${wsBase}/ws/chat/${sessionId}?token=${accessToken}`;
  }

  /**
   * Check if a session has messages
   */
  async hasMessages(sessionId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error checking messages:', error);
        return false;
    }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Error checking messages:', error);
      return false;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
