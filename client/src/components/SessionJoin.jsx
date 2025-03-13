import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const SessionJoin = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [userSessions, setUserSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { 
    createSession, 
    joinSession, 
    leaveSession,
    getUserSessions,
    loading, 
    error, 
    user 
  } = useContext(SessionContext);
  const navigate = useNavigate();

  // Restrict access: Only a registered user may access /join
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch user's active sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!user) return;
      
      try {
        setLoadingSessions(true);
        const sessions = await getUserSessions();
        setUserSessions(sessions);
      } catch (err) {
        console.error('Error fetching user sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };
    
    fetchUserSessions();
  }, [user, getUserSessions]);

  // When creating a session
  const handleCreate = async (e) => {
    e.preventDefault();
    const session = await createSession();
    if (session) {
      navigate('/schedule');
    }
  };

  // When joining a session
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;
    
    const session = await joinSession(sessionCode);
    if (session) {
      navigate('/schedule');
    }
  };
  
  // Navigate to an existing session
  const handleSessionClick = (sessionCode) => {
    joinSession(sessionCode).then(session => {
      if (session) {
        navigate('/schedule');
      }
    });
  };
  
  // Leave a session
  const handleLeaveSession = async (e, sessionCode) => {
    e.stopPropagation(); // Prevent navigating to the session
    
    if (window.confirm(`Are you sure you want to leave session ${sessionCode}?`)) {
      const success = await leaveSession(sessionCode);
      if (success) {
        // Update the sessions list
        setUserSessions(userSessions.filter(s => s.session_code !== sessionCode));
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="card p-4 my-4">
        <h2 className="text-center mb-4">Join or Create a Session</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0 text-center">Join Existing Session</h5>
              </div>
              <div className="card-body d-flex flex-column">
                <form onSubmit={handleJoin} className="mb-3 flex-grow-1">
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
                  <div className="d-grid mt-auto">
                    <div></div> {/* Spacer */}
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
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h5 className="card-title mb-0 text-center">Create New Session</h5>
              </div>
              <div className="card-body d-flex flex-column">
                <p className="text-muted mb-4 flex-grow-1">
                  Start a new session and invite others to join using your unique code.
                </p>
                <div className="d-grid mt-auto">
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

        {/* Display user's active sessions in table format */}
        <div className="mt-4">
          <h4 className="mb-3">Your Active Sessions</h4>
          {loadingSessions ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your sessions...</p>
            </div>
          ) : userSessions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Session Code</th>
                    <th>Participants</th>
                    <th className="text-center">Leave Session</th>
                  </tr>
                </thead>
                <tbody>
                  {userSessions.map(session => (
                    <tr key={session.session_code} style={{ cursor: 'pointer' }}>
                      <td 
                        onClick={() => handleSessionClick(session.session_code)}
                        className="fw-bold"
                      >
                        {session.session_code}
                      </td>
                      <td onClick={() => handleSessionClick(session.session_code)}>
                        {session.user_names.join(', ')}
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={(e) => handleLeaveSession(e, session.session_code)}
                          title="Leave session"
                        >
                          <i className="fas fa-times"></i> Leave
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              You don't have any active sessions. Join an existing one or create a new session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionJoin;
