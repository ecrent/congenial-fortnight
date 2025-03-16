import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const SessionJoin = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [userSessions, setUserSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false); // Loading state for join button
  const [createLoading, setCreateLoading] = useState(false); // Loading state for create button
  const [loadingSessionCode, setLoadingSessionCode] = useState(''); // Track which session button is loading
  const [loadingAction, setLoadingAction] = useState(''); // Track which action (join/leave) is loading
  
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
    setCreateLoading(true);
    const session = await createSession();
    if (session) {
      navigate('/schedule');
    }
    setCreateLoading(false);
  };

  // When joining a session
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;
    
    setJoinLoading(true);
    const session = await joinSession(sessionCode);
    if (session) {
      navigate('/schedule');
    }
    setJoinLoading(false);
  };
  
  // Navigate to an existing session
  const handleSessionClick = (sessionCode) => {
    setLoadingSessionCode(sessionCode);
    setLoadingAction('join');
    
    joinSession(sessionCode).then(session => {
      if (session) {
        navigate('/schedule');
      }
      setLoadingSessionCode('');
      setLoadingAction('');
    }).catch(() => {
      setLoadingSessionCode('');
      setLoadingAction('');
    });
  };
  
  // Leave a session
  const handleLeaveSession = async (e, sessionCode) => {
    e.stopPropagation(); // Prevent navigating to the session
    
    if (window.confirm(`Are you sure you want to leave session ${sessionCode}?`)) {
      setLoadingSessionCode(sessionCode);
      setLoadingAction('leave');
      
      const success = await leaveSession(sessionCode);
      if (success) {
        // Update the sessions list
        setUserSessions(userSessions.filter(s => s.session_code !== sessionCode));
      }
      
      setLoadingSessionCode('');
      setLoadingAction('');
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
      
      <main id="main-content" className="page-container bg-pattern-light">
        <div className="container">
          <div className="content-card p-4 p-md-5 shadow-sm">
            <h1 className="text-center mb-4 fw-bold text-primary">Join or Create a Session</h1>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle me-2" aria-hidden="true"></i>
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  data-bs-dismiss="alert" 
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <section className="session-option p-4 h-100 bg-white" aria-labelledby="join-heading">
                  <div className="text-center mb-3">
                    <div className="session-icon-wrapper mb-3">
                      <i className="fas fa-sign-in-alt text-primary" aria-hidden="true"></i>
                    </div>
                    <h2 className="mb-3 fw-bold h5" id="join-heading">Join Existing Session</h2>
                  </div>
                  <form onSubmit={handleJoin} className="d-flex flex-column h-100">
                    <div className="flex-grow-1">
                      <label htmlFor="sessionCode" className="form-label">Session Code</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light" aria-hidden="true">
                          <i className="fas fa-hashtag"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          id="sessionCode"
                          value={sessionCode}
                          onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                          placeholder="Enter 8-character code"
                          maxLength="8"
                          disabled={joinLoading}
                          required
                          aria-describedby="sessionCodeHelp"
                        />
                      </div>
                      <small id="sessionCodeHelp" className="text-muted mt-2 d-block">
                        Enter the 8-character code provided by the session creator
                      </small>
                    </div>
                    <div className="button-container">
                      <div className="d-grid">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg transition-hover" 
                          disabled={joinLoading || !sessionCode.trim()}
                        >
                          {joinLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Loading...
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
                </section>
              </div>
              
              <div className="col-md-6">
                <section className="session-option p-4 h-100 bg-white" aria-labelledby="create-heading">
                  <div className="text-center mb-3">
                    <div className="session-icon-wrapper mb-3">
                      <i className="fas fa-plus-circle text-warning" aria-hidden="true"></i>
                    </div>
                    <h2 className="mb-3 fw-bold h5" id="create-heading">Create New Session</h2>
                  </div>
                  <div className="d-flex flex-column h-100">
                    <div className="flex-grow-1">
                      <p className="text-muted">
                        Start a new planning session and invite your team members to join using your unique session code.
                      </p>
                    </div>
                    <div className="button-container">
                      <div className="d-grid">
                        <button 
                          onClick={handleCreate} 
                          className="btn btn-warning btn-lg transition-hover" 
                          disabled={createLoading}
                        >
                          {createLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Loading...
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
                </section>
              </div>
            </div>
            
            {/* Display user's active sessions with improved styling */}
            <section className="active-sessions mt-5" aria-labelledby="active-sessions-heading">
              <div className="section-header p-2 rounded-top">
                <h2 id="active-sessions-heading" className="mb-0 text-center session-header-text h5">Your Active Sessions</h2>
              </div>
              
              <div className="p-4 bg-white rounded-bottom shadow-sm">
                {loadingSessions ? (
                  <div className="text-center my-4" aria-live="polite">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your sessions...</p>
                  </div>
                ) : userSessions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle" aria-label="Your active sessions">
                      <caption className="visually-hidden">List of your active sessions and actions you can take</caption>
                      <thead className="table-light">
                        <tr>
                          <th scope="col">Session Code</th>
                          <th scope="col">Participants</th>
                          <th scope="col" className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSessions.map(session => (
                          <tr key={session.session_code} className="session-row">
                            <td 
                              onClick={() => handleSessionClick(session.session_code)}
                              className="fw-bold session-code cursor-pointer"
                            >
                              <i className="fas fa-calendar-alt me-2 text-primary"></i>
                              {session.session_code}
                            </td>
                            <td onClick={() => handleSessionClick(session.session_code)} className="cursor-pointer">
                              <div className="participant-list">
                                {session.user_names.map((name, index) => (
                                  <span key={index} className="participant-badge">
                                    <i className="fas fa-user-circle me-1 text-secondary"></i>
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
                                  disabled={loadingSessionCode === session.session_code}
                                  title="Join session"
                                >
                                  {(loadingSessionCode === session.session_code && loadingAction === 'join') ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-sign-in-alt me-1"></i> Join
                                    </>
                                  )}
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm" 
                                  onClick={(e) => handleLeaveSession(e, session.session_code)}
                                  disabled={loadingSessionCode === session.session_code}
                                  title="Leave session"
                                >
                                  {(loadingSessionCode === session.session_code && loadingAction === 'leave') ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-times me-1"></i> Leave
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state text-center p-5" role="status">
                    <div className="empty-state-icon mb-4">
                      <i className="fas fa-calendar-day fa-4x text-secondary opacity-50" aria-hidden="true"></i>
                    </div>
                    <h3 className="text-primary h4">No Active Sessions</h3>
                    <p className="text-muted mb-4">You haven't joined any sessions yet. Create a new one or join with a session code.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default SessionJoin;
