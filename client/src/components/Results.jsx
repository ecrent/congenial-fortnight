import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Scheduler from '../apis/Scheduler';
import Header from '../components/Header';

const Results = () => {
  const { session, user, setUserReady, initialLoading } = useContext(SessionContext);
  const [optimalTimes, setOptimalTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(60); // Default duration in minutes
  
  const navigate = useNavigate();
  
  // Redirect if no session or user
  useEffect(() => {
    if (initialLoading) return; // Wait for session loading to complete
    
    if (!session || !user) {
      navigate('/join');
    }
  }, [session, user, navigate, initialLoading]);
  
  // Fetch users to check ready status
  useEffect(() => {
    if (!session) return;
    
    const fetchUsers = async () => {
      try {
        // Fix the URL to use session_code instead of id
        const response = await Scheduler.get(`/users/session/${session.session_code}`);
        
        // More strict checks to prevent single user from seeing results:
        // 1. Must have at least 2 users
        // 2. All users must be ready
        const allUsers = response.data.data.users || [];
        const readyUsers = allUsers.filter(u => u.is_ready);
        
        if (allUsers.length < 2 || readyUsers.length !== allUsers.length || readyUsers.length < 2) {
          // Redirect back to schedule page if conditions aren't met
          navigate('/schedule');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        // If there's an error fetching user data, redirect to be safe
        navigate('/schedule');
      }
    };
    
    fetchUsers();
    // Also set up a periodic check to handle dynamic changes
    const interval = setInterval(fetchUsers, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [session, navigate]);
  
  // Fetch optimal meeting times
  useEffect(() => {
    const fetchOptimalTimes = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        const response = await Scheduler.get(`/optimal-times/${session.session_code}?duration=${duration}`);
        setOptimalTimes(response.data.data.optimalTimes || []);
      } catch (err) {
        console.error('Error fetching optimal times:', err);
        setError('Failed to calculate optimal meeting times');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptimalTimes();
  }, [session, duration]);
  
  const handleDurationChange = (e) => {
    setDuration(parseInt(e.target.value, 10));
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
  
  const handleBack = async () => {
    // Mark user as not ready
    await setUserReady(false);
    navigate('/schedule');
  };
  
  return (
    <>
      <Header />
      
      <main id="main-content" className="page-container bg-pattern-light">
        <div className="container">
          <div className="content-card bg-white p-4 p-md-5 shadow-sm rounded-3">
            {/* Add back navigation arrow */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={handleBack}
                aria-label="Back to Schedule Input"
              >
                <i className="fas fa-arrow-left me-1" aria-hidden="true"></i> Back to Schedule
              </button>
              <div className="session-badge">
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  <i className="fas fa-calendar-alt me-2" aria-hidden="true"></i>
                  Session: {session?.session_code}
                </span>
              </div>
            </div>

            <h1 className="text-center mb-4 fw-bold text-primary">Optimal Meeting Times</h1>

            
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
            
            <div className="card availability-form mb-4 shadow-sm border-0">
              <div className="card-header bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2 text-primary"></i>
                  Meeting Duration
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="duration" className="form-label">
                    Minimum meeting duration:
                  </label>
                  <select 
                    id="duration" 
                    className="form-select form-select-lg" 
                    value={duration} 
                    onChange={handleDurationChange}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="card available-times shadow-sm border-0">
              <div className="card-header bg-light border-0">
                <h2 className="mb-0 h5">
                  <i className="fas fa-list-alt me-2 text-primary" aria-hidden="true"></i>
                  Best Meeting Times
                </h2>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center my-4" aria-live="polite">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Calculating best times...</p>
                  </div>
                ) : optimalTimes.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle" aria-label="Optimal meeting times">
                      <caption className="visually-hidden">List of optimal meeting times sorted by day and time</caption>
                      <thead className="table-light">
                        <tr>
                          <th scope="col">Day</th>
                          <th scope="col">Start Time</th>
                          <th scope="col">End Time</th>
                          <th scope="col">Users Available</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimalTimes.map((time, index) => (
                          <tr key={index}>
                            <td>
                              <span className="day-badge">{getDayName(parseInt(time.day_of_week))}</span>
                            </td>
                            <td>{formatTime(time.start_time)}</td>
                            <td>{formatTime(time.end_time)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <span className="badge bg-success rounded-pill">
                                    {time.user_count}/{time.total_users}
                                  </span>
                                </div>
                                {time.available_users && (
                                  <div className="user-list">
                                    {time.available_users.map((username, i) => (
                                      <span key={i} className="participant-badge me-1">
                                        <i className="fas fa-user me-1"></i>
                                        {username}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state text-center p-4" role="status">
                    <div className="empty-state-icon mb-3">
                      <i className="fas fa-calendar-times fa-3x text-warning opacity-50" aria-hidden="true"></i>
                    </div>
                    <p className="text-warning fw-bold mb-1">No Common Times Found</p>
                    <p className="text-muted">Try adjusting the minimum duration or ask participants to add more available times.</p>
                  </div>
                )}
              </div>
              <div className="card-footer bg-white border-0 pt-0 pb-3">
                <div className="d-grid">
                  <button 
                    onClick={handleBack} 
                    className="btn btn-primary btn-lg transition-hover"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Schedule Input
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Results;
