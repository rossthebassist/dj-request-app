import { useState, useEffect } from 'react';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method = 'GET', body = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, request };
}
