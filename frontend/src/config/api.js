// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: `${API_BASE_URL}/auth/login`,
      callback: `${API_BASE_URL}/auth/callback`,
      user: `${API_BASE_URL}/auth/user`,
      logout: `${API_BASE_URL}/auth/logout`
    },
    playlists: {
      list: `${API_BASE_URL}/playlists`,
      create: `${API_BASE_URL}/playlists`
    },
    search: `${API_BASE_URL}/search`,
    events: {
      create: `${API_BASE_URL}/events`,
      list: `${API_BASE_URL}/events`,
      get: (id) => `${API_BASE_URL}/events/${id}`,
      update: (id) => `${API_BASE_URL}/events/${id}`,
      delete: (id) => `${API_BASE_URL}/events/${id}`
    },
    requests: {
      create: `${API_BASE_URL}/requests`,
      getTop: (eventId) => `${API_BASE_URL}/requests/event/${eventId}/top`,
      vote: (id) => `${API_BASE_URL}/requests/${id}/vote`,
      played: (id) => `${API_BASE_URL}/requests/${id}/played`
    }
  }
};

export async function apiCall(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
}
