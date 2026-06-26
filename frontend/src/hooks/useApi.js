import { useState } from 'react';
import { API_CONFIG, apiCall } from '../config/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method = 'GET', body = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        method,
        ...options
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const result = await apiCall(endpoint, config);
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
