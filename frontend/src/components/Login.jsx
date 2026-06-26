import { useState } from 'react';
import { Music } from 'lucide-react';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use environment variable or fallback to relative URL
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const loginUrl = `${apiUrl}/auth/login`;
      
      console.log('Calling login endpoint:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { authUrl } = await response.json();
      console.log('Got auth URL, redirecting...');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <Music size={64} />
        </div>
        <h1>DJ Song Requests</h1>
        <p>Request songs for your favorite events</p>
        {error && (
          <div style={{ 
            color: '#ff6b6b', 
            marginBottom: '16px', 
            fontSize: '14px',
            padding: '12px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}
        <button
          className="btn btn-primary btn-large"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Login with Spotify'}
        </button>
      </div>
    </div>
  );
}

export default Login;
