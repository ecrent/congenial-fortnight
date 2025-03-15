import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from './Header';

const Home = () => {
  const { clearSession } = useContext(SessionContext);
  
  // Clear session when home page is loaded
  useEffect(() => {
    clearSession();
  }, [clearSession]);

  return (
    <div>
      <Header />
      <div className="jumbotron text-center">
        <h2 className="display-4 mb-4">Welcome to Meeting Time Finder</h2>
        <p className="lead">
          Find the best time for your group meetings by sharing your availability
        </p>
        
        <div className="mt-5 d-flex justify-content-center gap-4">
          <Link to="/login" className="btn btn-primary btn-lg">
              Login
          </Link>
          <span></span>
          <Link to="/register" className="btn btn-warning btn-lg">
              Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;