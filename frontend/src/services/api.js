/**
 * NexaChat Frontend API Client & SSE Stream Reader
 */

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api';

// Helper to get stored auth token
const getToken = () => localStorage.getItem('nexachat_token');

// Generic JSON fetch helper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An API error occurred');
  }

  return data;
}

// AUTH API
export const authApi = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request('/auth/me', { method: 'GET' }),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// CONVERSATIONS API
export const conversationsApi = {
  getAll: () =>
    request('/conversations', { method: 'GET' }),

  create: (title) =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  getById: (id) =>
    request(`/conversations/${id}`, { method: 'GET' }),

  update: (id, data) =>
    request(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/conversations/${id}`, { method: 'DELETE' }),
};

// CHAT API WITH SSE STREAMING SUPPORT
export const chatApi = {
  /**
   * Stream a chat message response via Server-Sent Events (SSE)
   */
  async streamMessage({ conversationId, message, onMeta, onChunk, onDone, onError, signal }) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId, message, stream: true }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace(/^data:\s*/, '');
            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'meta' && onMeta) {
                onMeta(payload);
              } else if (payload.type === 'chunk' && onChunk) {
                onChunk(payload.text);
              } else if (payload.type === 'done' && onDone) {
                onDone(payload);
              }
            } catch (err) {
              console.error('SSE parse error:', err, dataStr);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Chat response stream aborted by user');
      } else {
        if (onError) onError(err);
      }
    }
  },

  /**
   * Regenerate response for last user message
   */
  async streamRegenerate({ conversationId, onMeta, onChunk, onDone, onError, signal }) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/regenerate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace(/^data:\s*/, '');
            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'meta' && onMeta) {
                onMeta(payload);
              } else if (payload.type === 'chunk' && onChunk) {
                onChunk(payload.text);
              } else if (payload.type === 'done' && onDone) {
                onDone(payload);
              }
            } catch (err) {
              console.error('SSE parse error:', err);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Regenerate stream aborted');
      } else {
        if (onError) onError(err);
      }
    }
  }
};
