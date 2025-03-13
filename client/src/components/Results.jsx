import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Scheduler from '../apis/Scheduler';
import Header from '../components/Header';

const Results = () => {
  const { session, user, setUserReady } = useContext(SessionContext);
  const [optimalTimes, setOptimalTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(60); // Default duration in minutes
  
  const navigate = useNavigate();
  
  // Redirect if no session or user
  useEffect(() => {
    if (!session || !user) {
      navigate('/join');
    }
  }, [session, user, navigate]);
  
  // Fetch users to check ready status
  useEffect(() => {
    if (!session) return;
    
    const fetchUsers = async () => {
      try {
        // Fix the URL to use session_code instead of id
        const response = await Scheduler.get(`/users/session/${session.session_code}`);
        
        // If not all users are ready, go back to schedule input
        const allUsers = response.data.data.users || [];
        const readyUsers = allUsers.filter(u => u.is_ready);
        if (allUsers.length === 0 || readyUsers.length < allUsers.length) {
          navigate('/schedule');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    
    fetchUsers();
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
    <div>
      <Header />
      <div className="card p-4 my-4">
        <h2 className="text-center mb-4">Optimal Meeting Times</h2>
        
        <div className="alert alert-info">
          <strong>Session:</strong> {session?.session_code} | <strong>Name:</strong> {user?.name}
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="duration" className="form-label">
            Minimum meeting duration (minutes):
          </label>
          <select 
            id="duration" 
            className="form-select" 
            value={duration} 
            onChange={handleDurationChange}
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Calculating best times...</p>
          </div>
        ) : optimalTimes.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Users Available</th>
                </tr>
              </thead>
              <tbody>
                {optimalTimes.map((time, index) => (
                  <tr key={index}>
                    <td>{getDayName(parseInt(time.day_of_week))}</td>
                    <td>{formatTime(time.start_time)}</td>
                    <td>{formatTime(time.end_time)}</td>
                    <td>
                      {time.user_count} / {time.total_users}
                      {time.available_users && (
                        <span className="ms-2 text-muted">
                          ({time.available_users.join(', ')})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-warning">
            No common available times found. Try adjusting the minimum duration or ask participants to add more available times.
          </div>
        )}
        
        <div className="d-flex justify-content-between mt-4">
          <button onClick={handleBack} className="btn btn-secondary">
            Back to Schedule Input
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
