import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { API_CONFIG, apiCall } from '../config/api';
import './Dashboard.css';

function Dashboard({ user, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall(API_CONFIG.endpoints.events.list);
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Events</h1>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <Plus size={20} /> New Event
        </button>
      </div>

      {loading && <p>Loading events...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">No events yet. Create one to get started!</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              {event.bannerImageUrl && (
                <div className="event-banner" style={{
                  backgroundImage: `url(${event.bannerImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
              )}
              <div className="event-content" style={{
                backgroundColor: event.primaryColor
              }}>
                <h3>{event.name}</h3>
                <p>Created {new Date(event.createdAt).toLocaleDateString()}</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => onSelectEvent(event.id)}
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  View Requests
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
