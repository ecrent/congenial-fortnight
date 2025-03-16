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
    user,
    initialLoading
  } = useContext(SessionContext);
  const navigate = useNavigate();

  // Restrict access: Only a registered user may access /join
  useEffect(() => {
    if (initialLoading) return; // Wait for session loading to complete
    
    if (!user) {
      navigate('/');
    }
  }, [user, navigate, initialLoading]);

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

  if (initialLoading) {
    return (
      <div className="page-container d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="page-container">
        <div className="container">
          <div className="content-card p-4 p-md-5">
            <h2 className="text-center mb-4 fw-bold">Join or Create a Session</h2>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              </div>
            )}
            
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="session-option p-4">
                  <h5 className="mb-3"><i className="fas fa-sign-in-alt me-2 text-primary"></i>Join Existing Session</h5>
                  <form onSubmit={handleJoin}>
                    <div className="mb-3">
                      <label htmlFor="sessionCode" className="form-label">Session Code</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-hashtag"></i>
                        </span>
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
                      <small className="text-muted mt-2 d-block">
                        Enter the 8-character code provided by the session creator
                      </small>
                    </div>
                    <div style={{ marginTop: '4.5rem' }}>
                      <div className="d-grid">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg" 
                          disabled={loading || !sessionCode.trim()}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Joining...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sign-in-alt me-2"></i>
                              Join Session
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="session-option p-4">
                  <h5 className="mb-3"><i className="fas fa-plus-circle me-2 text-accent"></i>Create New Session</h5>
                  <p className="text-muted mb-4">
                    Start a new planning session and invite your team members to join using your unique session code.
                  </p>
                  <div style={{ marginTop: '6rem' }}>
                    <div className="d-grid">
                      <button 
                        onClick={handleCreate} 
                        className="btn btn-accent btn-lg" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus-circle me-2"></i>
                            Create New Session
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display user's active sessions with improved styling */}
            <div className="active-sessions mt-5">
              <div className="section-header p-3 rounded">
                <h3 className="mb-0 text-center session-header-text">Your Active Sessions</h3>
              </div>
              
              <div className="p-4">
                {loadingSessions ? (
                  <div className="text-center my-4">
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
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSessions.map(session => (
                          <tr key={session.session_code} className="session-row">
                            <td 
                              onClick={() => handleSessionClick(session.session_code)}
                              className="fw-bold session-code"
                            >
                              <i className="fas fa-calendar-alt me-2 text-primary"></i>
                              {session.session_code}
                            </td>
                            <td onClick={() => handleSessionClick(session.session_code)}>
                              <div className="participant-list">
                                {session.user_names.map((name, index) => (
                                  <span key={index} className="participant-badge">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="btn-group">
                                <button 
                                  className="btn btn-outline-primary btn-sm" 
                                  onClick={() => handleSessionClick(session.session_code)}
                                  title="Join session"
                                >
                                  <i className="fas fa-sign-in-alt me-1"></i> Join
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm" 
                                  onClick={(e) => handleLeaveSession(e, session.session_code)}
                                  title="Leave session"
                                >
                                  <i className="fas fa-times me-1"></i> Leave
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state text-center p-4">
                    <div className="empty-state-icon mb-3">
                      <i className="fas fa-calendar-day fa-4x text-secondary opacity-50"></i>
                    </div>
                    <h4>No Active Sessions</h4>
                    <p className="text-muted mb-4">You haven't joined any sessions yet. Create a new one or join with a session code.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionJoin;
