import { useState } from 'react';
import { Music } from 'lucide-react';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
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
