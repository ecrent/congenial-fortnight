import React, { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, clearSession } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/'); // Changed from '/join' to home page
  };

  return (
    <header role="banner" className="container-fluid d-flex justify-content-between align-items-center">
      <h1 className="font-weight-light display-1 text-center">Meeting Time Finder</h1>
      {user && (
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;