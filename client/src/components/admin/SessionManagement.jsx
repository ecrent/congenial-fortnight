import React, { useState, useEffect, useContext } from 'react';
import Scheduler from '../../apis/Scheduler';
import { SessionContext } from '../../context/SessionContext';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const { user: adminUser } = useContext(SessionContext);
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await Scheduler.get(`/admin/sessions?name=${adminUser.name}`);
      setSessions(response.data.data.sessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. You may not have admin privileges.');
    } finally {
      setLoading(false);
    }
  };
  
  const viewSessionDetails = async (sessionCode) => {
    try {
      setSelectedSession(sessionCode);
      setDetailsLoading(true);
      
      // Get schedules for the selected session
      const response = await Scheduler.get(`/admin/schedules?name=${adminUser.name}`);
      
      // Filter schedules for the selected session
      const sessionSchedules = response.data.data.schedules.filter(
        schedule => schedule.session_code === sessionCode
      );
      
      setSessionDetails(sessionSchedules);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError(err.response?.data?.message || 'Failed to fetch session details');
    } finally {
      setDetailsLoading(false);
    }
  };
  
  const handleDelete = async (sessionCode) => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await Scheduler.delete(`/admin/sessions/${sessionCode}?name=${adminUser.name}`);
      setSessions(sessions.filter(session => session.session_code !== sessionCode));
      if (selectedSession === sessionCode) {
        setSelectedSession(null);
        setSessionDetails([]);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err.response?.data?.message || 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };
  
  const extendSession = async (sessionCode) => {
    try {
      const response = await Scheduler.put(
        `/admin/sessions/${sessionCode}/extend?name=${adminUser.name}`
      );
      
      // Update the session in the list
      setSessions(sessions.map(session => 
        session.session_code === sessionCode ? response.data.data.session : session
      ));
      
    } catch (err) {
      console.error('Error extending session:', err);
      setError(err.response?.data?.message || 'Failed to extend session');
    }
  };
  
  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Unknown';
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };
  
  if (loading && sessions.length === 0) {
    return <div className="text-center my-5">Loading...</div>;
  }
  
  return (
    <div>
      <h3 className="mb-4">Session Management</h3>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-6 mb-4">
          <h4>Sessions</h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th>Session Code</th>
                  <th>Users</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr 
                    key={session.session_code} 
                    className={selectedSession === session.session_code ? 'table-active' : ''}
                  >
                    <td>
                      <span className={isExpired(session.expires_at) ? 'text-decoration-line-through' : ''}>
                        {session.session_code}
                      </span>
                    </td>
                    <td>{session.user_count}</td>
                    <td>{new Date(session.created_at).toLocaleString()}</td>
                    <td>
                      <span className={isExpired(session.expires_at) ? 'text-danger' : ''}>
                        {new Date(session.expires_at).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => viewSessionDetails(session.session_code)}
                        >
                          View
                        </button>
                        {isExpired(session.expires_at) ? (
                          <button
                            className="btn btn-outline-success"
                            onClick={() => extendSession(session.session_code)}
                          >
                            Extend
                          </button>
                        ) : null}
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(session.session_code)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sessions.length === 0 && !loading && (
            <div className="alert alert-info">No sessions found.</div>
          )}
        </div>
        
        <div className="col-lg-6">
          <h4>Session Details</h4>
          {!selectedSession ? (
            <div className="alert alert-info">Select a session to view details</div>
          ) : detailsLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading session details...</p>
            </div>
          ) : sessionDetails.length > 0 ? (
            <div>
              <div className="alert alert-info mb-3">
                <strong>Session Code:</strong> {selectedSession}
              </div>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Day</th>
                      <th>Start</th>
                      <th>End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionDetails.map(schedule => (
                      <tr key={schedule.id}>
                        <td>{schedule.user_name}</td>
                        <td>{getDayName(parseInt(schedule.day_of_week))}</td>
                        <td>{formatTime(schedule.start_time)}</td>
                        <td>{formatTime(schedule.end_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* "View Optimal Times" button removed as requested */}
            </div>
          ) : (
            <div className="alert alert-warning">
              No schedules found for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
