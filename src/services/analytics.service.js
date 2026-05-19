import api from './api';
import { API_BASE_URL } from './api';

export const analyticsService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getRecentTickets: async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
  },

  getActivityFeed: async () => {
    const response = await api.get('/admin/feed');
    return response.data;
  },

  getSecurityLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  /**
   * Listen to real-time events via Server-Sent Events (SSE)
   * This provides live updates without polling.
   */
  subscribeToEvents: (onEvent, onError) => {
    // SSE uses EventSource. Note: browsers don't natively support custom headers for EventSource.
    // If the backend guards the endpoint, we might need a token in the URL or rely on cookies.
    // Since we created the backend endpoint without a guard for now, this works directly.
    const token = localStorage.getItem('accessToken');
    const url = token ? `${API_BASE_URL}/events/stream?token=${token}` : `${API_BASE_URL}/events/stream`;
    
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onEvent(parsed);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (error) => {
      if (onError) onError(error);
      // Auto-reconnect is built-in, but we can log errors here
      console.error('SSE Error:', error);
    };

    return eventSource; // return instance so caller can close() it
  }
};
