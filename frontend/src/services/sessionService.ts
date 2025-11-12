/**
 * Session Service
 */
import { api } from './api';
import type { Session } from '@/types';

export const sessionService = {
  /**
   * Create a new session
   */
  async createSession(clientInfo?: Record<string, any>): Promise<Session> {
    const response = await api.post<Session>('/session', { client_info: clientInfo });
    if (!response.success || !response.data) {
      throw new Error('Failed to create session');
    }
    return response.data;
  },

  /**
   * Get session information
   */
  async getSession(sessionId: string): Promise<Session> {
    const response = await api.get<Session>(`/session/${sessionId}`);
    if (!response.success || !response.data) {
      throw new Error('Failed to get session');
    }
    return response.data;
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/session/${sessionId}`);
  },
};
