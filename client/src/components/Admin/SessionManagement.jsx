import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Header from '../Header';
import AdminMenu from './AdminMenu';

const SessionManagement = () => {
  const { user, initialLoading, getAllSessions, error: contextError } = useContext(SessionContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const navigate = useNavigate();
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (initialLoading) return;

    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate, initialLoading]);
  
  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      const sessionsData = await getAllSessions();
      if (sessionsData) {
        setSessions(sessionsData);
      }
      setLoading(false);
    };
    
    if (user && user.role === 'admin') {
      loadSessions();
    }
  }, [user, getAllSessions]);
  
  // Show context errors
  useEffect(() => {
    if (contextError) {
      setStatusMessage(contextError);
      setStatusType('danger');
    }
  }, [contextError]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if a session is active
  const isSessionActive = (expiresAt) => {
    return new Date(expiresAt) > new Date();
  };
  
  // If still loading initial data, show loading indicator
  if (initialLoading) {
    return <div className="text-center my-5">Loading...</div>;
  }
  
  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Session Management</h4>
              </div>
              <div className="card-body">
                {statusMessage && (
                  <div className={`alert alert-${statusType} alert-dismissible fade show`}>
                    {statusMessage}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setStatusMessage('')}
                    ></button>
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading sessions...</span>
                    </div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="alert alert-info">
                    No sessions found.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Session Code</th>
                          <th>Created</th>
                          <th>Expires</th>
                          <th>Status</th>
                          <th>Participants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(session => (
                          <tr key={session.id}>
                            <td>{session.session_code}</td>
                            <td>{formatDate(session.created_at)}</td>
                            <td>{formatDate(session.expires_at)}</td>
                            <td>
                              <span className={`badge bg-${isSessionActive(session.expires_at) ? 'success' : 'danger'}`}>
                                {isSessionActive(session.expires_at) ? 'Active' : 'Expired'}
                              </span>
                            </td>
                            <td>{session.user_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
