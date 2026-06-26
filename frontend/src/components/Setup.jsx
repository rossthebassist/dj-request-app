import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './Setup.css';

function Setup({ user, onEventCreated }) {
  const [step, setStep] = useState(1);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  
  const [eventConfig, setEventConfig] = useState({
    name: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    accentColor: '#F7931E',
    textColor: '#FFFFFF',
    bannerImageUrl: '',
    backgroundGradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
  });

  useEffect(() => {
    if (step === 1) {
      fetchPlaylists();
    }
  }, [step]);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/playlists');
      if (!response.ok) throw new Error('Failed to fetch playlists');
      const data = await response.json();
      setPlaylists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName })
      });
      if (!response.ok) throw new Error('Failed to create playlist');
      const playlist = await response.json();
      setPlaylists([playlist, ...playlists]);
      setSelectedPlaylist(playlist);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!selectedPlaylist) {
      setError('Please select or create a playlist');
      return;
    }
    if (!eventConfig.name.trim()) {
      setError('Event name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventConfig,
          playlistId: selectedPlaylist.id
        })
      });
      if (!response.ok) throw new Error('Failed to create event');
      onEventCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>Setup Your Event</h1>
          <p>Step {step} of 2</p>
        </div>

        {step === 1 && (
          <div className="setup-step">
            <h2>Select or Create Playlist</h2>
            
            {showCreatePlaylist ? (
              <div className="create-playlist-form">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
                />
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreatePlaylist}
                    disabled={loading}
                  >
                    Create Playlist
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreatePlaylist(false);
                      setNewPlaylistName('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="playlist-list">
                  {loading && <p>Loading playlists...</p>}
                  {error && <p className="error-text">{error}</p>}
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`playlist-item ${selectedPlaylist?.id === playlist.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPlaylist(playlist)}
                    >
                      {playlist.image && <img src={playlist.image} alt={playlist.name} />}
                      <div className="playlist-info">
                        <div className="playlist-name">{playlist.name}</div>
                        <div className="playlist-meta">{playlist.tracks} songs</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-accent btn-block"
                  onClick={() => setShowCreatePlaylist(true)}
                >
                  Create New Playlist
                </button>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h2>Customize Event</h2>
            
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Summer Party 2024"
                value={eventConfig.name}
                onChange={(e) => setEventConfig({ ...eventConfig, name: e.target.value })}
              />
            </div>

            <div className="color-grid">
              <div className="form-group">
                <label>Primary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    className="color-input"
                    value={eventConfig.primaryColor}
                    onChange={(e) => setEventConfig({ ...eventConfig, primaryColor: e.target.value })}
                  />
                  <span>{eventConfig.primaryColor}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Secondary Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    className="color-input"
                    value={eventConfig.secondaryColor}
                    onChange={(e) => setEventConfig({ ...eventConfig, secondaryColor: e.target.value })}
                  />
                  <span>{eventConfig.secondaryColor}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Accent Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    className="color-input"
                    value={eventConfig.accentColor}
                    onChange={(e) => setEventConfig({ ...eventConfig, accentColor: e.target.value })}
                  />
                  <span>{eventConfig.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Banner Image URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://..."
                value={eventConfig.bannerImageUrl}
                onChange={(e) => setEventConfig({ ...eventConfig, bannerImageUrl: e.target.value })}
              />
            </div>

            {error && <p className="error-text">{error}</p>}
          </div>
        )}

        <div className="setup-actions">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 2 && selectedPlaylist && (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next
            </button>
          )}
          {step === 2 && (
            <button
              className="btn btn-primary"
              onClick={handleCreateEvent}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Setup;
