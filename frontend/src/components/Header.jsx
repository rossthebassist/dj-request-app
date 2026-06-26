import { Music } from 'lucide-react';
import './Header.css';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <Music size={28} />
          <h1>DJ Requests</h1>
        </div>
        <div className="header-user">
          <span>{user?.name || user?.id}</span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
