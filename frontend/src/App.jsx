import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Setup from './components/Setup';
import EventRequests from './components/EventRequests';
import Dashboard from './components/Dashboard';
import './styles/main.css';

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if we're coming back from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const callbackToken = params.get('token');

    if (userId && callbackToken) {
      setUser({ id: userId });
      setToken(callbackToken);
      setPage('setup');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleEventSelect = (id) => {
    setEventId(id);
    setPage('requests');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setEventId(null);
    setPage('login');
  };

  return (
    <div className="app">
      {page !== 'requests' && user && (
        <Header user={user} onLogout={handleLogout} />
      )}
      
      {page === 'login' && (
        <Login onLoginSuccess={(u) => {
          setUser(u);
          setPage('setup');
        }} />
      )}
      
      {page === 'setup' && user && (
        <Setup user={user} onEventCreated={() => setPage('dashboard')} />
      )}
      
      {page === 'dashboard' && user && (
        <Dashboard user={user} onSelectEvent={handleEventSelect} />
      )}
      
      {page === 'requests' && eventId && (
        <EventRequests eventId={eventId} onBack={() => {
          setPage('dashboard');
          setEventId(null);
        }} />
      )}
    </div>
  );
}

export default App;
