import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Volume2, ThumbsUp } from 'lucide-react';
import { useEventConfig } from '../hooks/useEventConfig';
import { API_CONFIG, apiCall } from '../config/api';
import './EventRequests.css';

function EventRequests({ eventId, onBack }) {
  const { config } = useEventConfig(eventId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  
  const [votedRequests, setVotedRequests] = useState(new Set());

  // Apply custom theme
  useEffect(() => {
    if (config) {
      document.documentElement.style.setProperty('--primary', config.primaryColor);
      document.documentElement.style.setProperty('--secondary', config.secondaryColor);
      document.documentElement.style.setProperty('--accent', config.accentColor);
      document.documentElement.style.setProperty('--text', config.textColor);
    }
  }, [config]);

  // Fetch requests
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchRequests = async () => {
    try {
      const data = await apiCall(API_CONFIG.endpoints.requests.getTop(eventId) + '?limit=10');
      setRequests(data);
      setRequestsError(null);
    } catch (err) {
      setRequestsError(err.message);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await apiCall(`${API_CONFIG.endpoints.search}?q=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Submit request
  const handleRequestSong = async (track) => {
    try {
      await apiCall(API_CONFIG.endpoints.requests.create, {
        method: 'POST',
        body: JSON.stringify({
          eventId,
          spotifyTrackId: track.id,
          spotifyTrackUri: track.uri,
          trackName: track.name,
          artistName: track.artist,
          albumImage: track.image
        })
      });
      
      await fetchRequests();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      setSearchError(err.message);
    }
  };

  // Vote on request
  const handleVote = async (requestId) => {
    if (votedRequests.has(requestId)) return;

    try {
      await apiCall(API_CONFIG.endpoints.requests.vote(requestId), {
        method: 'PUT'
      });
      
      setVotedRequests(new Set([...votedRequests, requestId]));
      await fetchRequests();
    } catch (err) {
      setRequestsError(err.message);
    }
  };

  if (!config) {
    return <div className="loading">Loading event...</div>;
  }

  return (
    <div className="event-requests-container" style={{
      background: config.backgroundGradient || 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <div className="requests-header">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h1>{config.name}</h1>
      </div>

      {config.bannerImageUrl && (
        <div className="event-banner-large" style={{
          backgroundImage: `url(${config.bannerImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
      )}

      <div className="requests-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search Spotify..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          {searchError && <p className="error-text">{searchError}</p>}

          {searchQuery && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((track) => (
                <div key={track.id} className="search-result-item">
                  {track.image && <img src={track.image} alt={track.name} />}
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleRequestSong(track)}
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchLoading && <p>Searching...</p>}
          {searchQuery && !searchLoading && searchResults.length === 0 && (
            <p className="no-results">No songs found</p>
          )}
        </div>

        {/* Requests List */}
        <div className="requests-section">
          <h2>Top Requests</h2>
          
          {requestsError && <p className="error-text">{requestsError}</p>}
          
          {requestsLoading && <p>Loading requests...</p>}
          
          {requests.length === 0 ? (
            <p className="no-requests">No requests yet. Be the first!</p>
          ) : (
            <div className="requests-list">
              {requests.map((request, index) => (
                <div key={request.id} className="request-item">
                  <div className="request-rank">{index + 1}</div>
                  {request.albumImage && (
                    <img src={request.albumImage} alt={request.trackName} className="request-image" />
                  )}
                  <div className="request-details">
                    <div className="request-title">{request.trackName}</div>
                    <div className="request-artist">{request.artistName}</div>
                  </div>
                  <button
                    className={`vote-button ${votedRequests.has(request.id) ? 'voted' : ''}`}
                    onClick={() => handleVote(request.id)}
                    disabled={votedRequests.has(request.id)}
                  >
                    <ThumbsUp size={18} />
                    {request.votes}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventRequests;
