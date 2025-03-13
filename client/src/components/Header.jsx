import React, { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, clearSession } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/'); // 
  };

  return (
    <header role="banner" className="mb-4">
      <div className="d-flex justify-content-between align-items-center py-3">
        <h1 className="font-weight-light">Meeting Time Finder</h1>
        {user && (
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      <hr className="mb-4" />
    </header>
  );
};

export default Header;