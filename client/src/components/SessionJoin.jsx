import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const SessionJoin = () => {
  const [sessionCode, setSessionCode] = useState('');
  const { createSession, joinSession, loading, error, user } = useContext(SessionContext);
  const navigate = useNavigate();

  // Restrict access: Only a registered user may access /join
  useEffect(() => {
    if (!user) {
      navigate('/'); // redirect to home page if not logged in
    }
  }, [user, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const session = await createSession();
    if (session) {
      navigate('/register');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;
    
    const session = await joinSession(sessionCode);
    if (session) {
      navigate('/register');
    }
  };

  return (
    <div>
      <Header />
      <div className="card p-4 my-4">
        <h2 className="text-center mb-4">Join or Create a Session</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="row">
          <div className="col-md-6 border-end">
            <h4 className="text-center">Join Existing Session</h4>
            <form onSubmit={handleJoin}>
              <div className="mb-3">
                <label htmlFor="sessionCode" className="form-label">Session Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength="8"
                  required
                />
              </div>
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading || !sessionCode.trim()}
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="col-md-6">
            <h4 className="text-center">Create New Session</h4>
            <p className="text-center text-muted mb-4">
              Start a new session and invite others to join using your unique code.
            </p>
            <div className="d-grid">
              <button 
                onClick={handleCreate} 
                className="btn btn-success" 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create New Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionJoin;
