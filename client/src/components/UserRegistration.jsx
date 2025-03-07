import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const UserRegistration = () => {
  const [name, setName] = useState('');
  const { session, registerUser, loading, error } = useContext(SessionContext);
  const navigate = useNavigate();

  // If no session, redirect to join page
  if (!session) {
    navigate('/join');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const user = await registerUser(name, session.id);
    if (user) {
      navigate('/schedule');
    }
  };

  return (
    <div>
      <Header />
      <div className="card p-4 my-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Enter Your Name</h2>
        
        <div className="alert alert-info">
          <p><strong>Session Code:</strong> {session.session_code}</p>
          <p className="mb-0"><small>Share this code with others so they can join this session</small></p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="userName" className="form-label">Your Name</label>
            <input
              type="text"
              className="form-control"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !name.trim()}
            >
              {loading ? 'Registering...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
