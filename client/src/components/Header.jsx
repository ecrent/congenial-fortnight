import React, { useContext, useState } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const { user, clearSession } = useContext(SessionContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate('/'); 
  };

  return (
    <header role="banner" className="navbar-header bg-pattern">
      <nav className="navbar navbar-expand-lg" aria-label="Main navigation">
        <div className="home-container">
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo positioned on the left with adjusted padding */}
            <Link to="/" className="navbar-brand d-flex align-items-center" aria-label="Meeting Time Finder - Home">
              <div className="logo-container me-2">
                <i className="fas fa-calendar-check logo-icon" aria-hidden="true"></i>
              </div>
              <div className="logo-text">
                <span className="logo-title">Meeting Time Finder</span>
                <span className="logo-tagline d-none d-sm-inline">Schedule Smarter</span>
              </div>
            </Link>
            
            {/* Mobile toggle button */}
            <button 
              className="navbar-toggler" 
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen ? "true" : "false"}
              aria-controls="main-navigation"
            >
              <i className="fas fa-bars" aria-hidden="true"></i>
            </button>
          </div>
          
          {/* Navigation links */}
          <div id="main-navigation" className={`collapse navbar-collapse mt-3 mt-lg-0 ${menuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-0 align-items-center">
              {!user && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-primary me-2">Sign In</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="btn btn-warning">Get Started</Link>
                  </li>
                </>
              )}
              
              {user && (
                <>
                  <li className="nav-item">
                    <span className="nav-link user-welcome">
                      <i className="fas fa-user-circle me-1" aria-hidden="true"></i> 
                      {user.name}
                    </span>
                  </li>
                  {user.role === 'admin' && (
                    <li className="nav-item mx-lg-2">
                      <Link to="/admin" className="btn btn-outline-primary btn-sm rounded-pill">
                        <i className="fas fa-cog me-1" aria-hidden="true"></i> Admin
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button 
                      className="btn btn-secondary btn-sm rounded-pill" 
                      onClick={handleLogout}
                      aria-label="Logout"
                    >
                      <i className="fas fa-sign-out-alt me-1" aria-hidden="true"></i> Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;