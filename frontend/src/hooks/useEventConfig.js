import { useState, useEffect } from 'react';
import { API_CONFIG, apiCall } from '../config/api';

export function useEventConfig(eventId) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await apiCall(API_CONFIG.endpoints.events.get(eventId));
        setConfig(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  return { config, loading, error };
}
