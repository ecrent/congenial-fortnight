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
    <header role="banner" className="mb-4">
      <div className="d-flex justify-content-between align-items-center py-3">
        <h1 className="font-weight-light">
          <Link to="/" className="text-decoration-none text-dark">Meeting Time Finder</Link>
        </h1>
        {user && (
          <div>
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-primary me-2">
                Admin Dashboard
              </Link>
            )}
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
      <hr className="mb-4" />
    </header>
  );
};

export default Header;