import { useState, useEffect } from 'react';

export function useEventConfig(eventId) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
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
