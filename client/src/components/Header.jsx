import React, { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const { user, clearSession } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/'); 
  };

  return (
    <header role="banner" className="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="fas fa-calendar-check me-2 text-primary"></i>
          <span className="fw-bold">Meeting Time Finder</span>
        </Link>
        
        <div className="ms-auto">
          {user ? (
            <div className="d-flex align-items-center">
              <span className="me-3 text-secondary">
                <i className="fas fa-user-circle me-1"></i>
                {user.name}
              </span>
              
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline-primary me-2">
                  <i className="fas fa-cog me-1"></i>
                  Admin
                </Link>
              )}
              
              <button className="btn btn-outline-secondary" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-1"></i>
                Logout
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;