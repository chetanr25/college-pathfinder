/**
 * Chat Service - WebSocket connection for AI chat
 */

// Convert HTTP/HTTPS URL to WS/WSS
const getWebSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return apiUrl.replace(/^http/, 'ws');
};

const WS_BASE_URL = getWebSocketUrl();

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system' | 'thinking';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ThinkingStep {
  step: string;
  timestamp: string;
}

export interface ToolCall {
  tool_name: string;
  parameters: Record<string, any>;
  status: 'started' | 'completed' | 'failed';
}

export type MessageHandler = (type: string, data: any) => void;

export class ChatService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL dynamically to ensure correct session ID
        const wsUrl = `${WS_BASE_URL}/chat/ws/${this.sessionId}`;
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        console.log('📌 Session ID:', this.sessionId);
        console.log('🌐 WS Base URL:', WS_BASE_URL);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket received:', data); // Debug log
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          console.error('❌ WebSocket URL was:', wsUrl);
          console.error('❌ Session ID:', this.sessionId);
          console.error('❌ WS Base URL:', WS_BASE_URL);
          console.error('❌ ReadyState:', this.ws?.readyState);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket closed');
          console.log('Close code:', event.code);
          console.log('Close reason:', event.reason);
          console.log('Was clean:', event.wasClean);
          this.handleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send chat message
   */
  sendMessage(message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(
      JSON.stringify({
        type: 'chat_message',
        message: message,
      })
    );
  }

  /**
   * Get conversation history
   */
  getHistory() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(
      JSON.stringify({
        type: 'get_history',
      })
    );
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: any) {
    this.messageHandlers.forEach((handler) => {
      handler(data.type, data);
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// REST API for session management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const chatApi = {
  /**
   * Create a new chat session
   */
  async createSession(): Promise<{ session_id: string; created_at: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  /**
   * Get session with full history
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
  },

  /**
   * Get messages from a session
   */
  async getMessages(sessionId: string, limit?: number): Promise<ChatMessage[]> {
    const url = new URL(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`);
    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Raw messages data from backend:', data);
    return data.messages || [];
  },
};
