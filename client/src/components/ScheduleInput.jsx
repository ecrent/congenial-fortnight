import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Scheduler from '../apis/Scheduler';
import Header from '../components/Header';

const ScheduleInput = () => {
  const { session, user, setUserReady, loading: sessionLoading, initialLoading } = useContext(SessionContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00'
  });
  const [usersList, setUsersList] = useState([]);
  
  const navigate = useNavigate();
  
  // 1. First useEffect checks if user and session exist in context
  useEffect(() => {
    if (initialLoading) return; // Don't redirect while still loading from localStorage
    
    if (!session || !user) {
      navigate('/join'); // Redirects if requirements not met
    }
  }, [session, user, navigate, initialLoading]);
  
  // 2. This useEffect loads the user's existing schedules from the backend
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await Scheduler.get(`/schedules/user/${user.name}`);
        setSchedules(response.data.data.schedules || []);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to load your availability');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules(); // Executes the API call
  }, [user]);

  // 3. This useEffect sets up polling to check other users' ready status
  useEffect(() => {
    if (!session) return;
    
    const fetchUsers = async () => {
      try {
        const response = await Scheduler.get(`/users/session/${session.session_code}`);
        const allUsers = response.data.data.users || [];
        setUsersList(allUsers);
        
        // Add debug information - this will help us see if the server is returning the correct number of users
        console.log(`Found ${allUsers.length} users in session ${session.session_code}`);
        console.log(`Ready users: ${allUsers.filter(u => u.is_ready).length}`);
        
        // CRITICAL FIX: We need to ensure there are at least 2 DISTINCT users in the session
        const readyUsers = allUsers.filter(u => u.is_ready);
        const currentUserReady = allUsers.find(u => u.id === user?.id)?.is_ready || false;
        
        // Force check that we have at least 2 unique users
        const uniqueUserIds = new Set(allUsers.map(u => u.id)).size;
        
        if (uniqueUserIds >= 2 && 
            readyUsers.length === allUsers.length &&
            currentUserReady && 
            readyUsers.length >= 2) {
          navigate('/results');
        } else {
          console.log(`Not navigating to results: ${uniqueUserIds} unique users, ${readyUsers.length}/${allUsers.length} ready`);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    // Changed polling interval from 3 seconds to 4 seconds
    const interval = setInterval(fetchUsers, 4000);
    fetchUsers(); // Initial fetch right away
    
    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, [session, navigate, user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add a helper function to check if time slots overlap
  const doTimeSlotsOverlap = (slot1, slot2) => {
    // Both slots are for the same day
    if (parseInt(slot1.day_of_week) !== parseInt(slot2.day_of_week)) {
      return false;
    }
    
    // Check for overlap
    return !(slot1.end_time <= slot2.start_time || slot1.start_time >= slot2.end_time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Create a new time slot object for validation
    const newSlot = {
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time
    };
    
    // Check for overlap with existing schedules
    const overlappingSlot = schedules.find(schedule => 
      doTimeSlotsOverlap(newSlot, schedule)
    );
    
    if (overlappingSlot) {
   
      setError(
        `This time overlaps with your existing schedule. ` 
      );
      return;
    }
    
    // Continue with existing code to add the schedule
    try {
      setLoading(true);
      const response = await Scheduler.post(`/schedules`, {
        session_code: session.session_code,
        user_name: user.name,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time
      });
      setSchedules([...schedules, response.data.data.schedule]);
      // Reset end time for next entry
      setFormData({
        ...formData,
        end_time: ''
      });
    } catch (err) {
      console.error('Error adding schedule:', err);
      setError(err.response?.data?.message || 'Failed to add availability');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await Scheduler.delete(`/schedules/${id}`);
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError('Failed to delete availability');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReadyClick = async () => {
    if (!user) return;
    
    setToggling(true); // Disable button immediately and show message
    try {
      const newReadyStatus = !isCurrentUserReady;
      await Scheduler.put(`/users/${user.name}/ready`, { isReady: newReadyStatus });
      setUserReady(newReadyStatus);
    } catch (err) {
      console.error('Error updating ready status:', err);
      setError('Failed to update ready status');
    } finally {
      // Keep the button disabled and message shown for 3 seconds
      setTimeout(() => {
        setToggling(false);
      }, 3000);
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
  
  if (sessionLoading) {
    return <div className="text-center my-5">Loading...</div>;
  }
  
  // Count ready users
  const readyUsers = usersList.filter(u => u.is_ready).length;
  const totalUsers = usersList.length;
  const isCurrentUserReady = usersList.some(u => u.id === user?.id && u.is_ready);
  
  // Add this function to handle navigation to join page
  const handleBackToJoin = () => {
    navigate('/join');
  };

  return (
    <>
      <Header />
      
      <main id="main-content" className="page-container bg-pattern-light">
        <div className="container">
          <div className="content-card bg-white p-4 p-md-5 shadow-sm rounded-3">
            {/* Session header with navigation */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={handleBackToJoin}
                aria-label="Back to Join Page"
              >
                <i className="fas fa-arrow-left me-1" aria-hidden="true"></i> Back to Join
              </button>
              <div className="session-badge">
                <span className="badge bg-primary rounded-pill px-3 py-2">
                  <i className="fas fa-calendar-alt me-2" aria-hidden="true"></i>
                  Session: {session?.session_code}
                </span>
              </div>
            </div>

            <h1 className="text-center mb-4 fw-bold text-primary">Set Your Availability</h1>
            
            {/* Session info card */}
            <div className="session-status card mb-4 border-0 bg-light">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="mb-2 mb-md-0">
                    <h2 className="mb-1 h5">
                      <i className="fas fa-user-circle me-2 text-primary" aria-hidden="true"></i>
                      Users in the Session
                    </h2>
                    <div className="text-muted mb-0 small" role="region" aria-label="Session participants">
                      {usersList.length > 0 ? (
                        <>
                          {usersList.map((user, index) => (
                            <span key={user.id} className="participant-badge me-1 mb-1">
                              <i className="fas fa-user me-1" aria-hidden="true"></i>
                              {user.name}
                              {user.is_ready && <i className="fas fa-check text-success ms-1" aria-label="Ready"></i>}
                            </span>
                          ))}
                        </>
                      ) : (
                        "No users have joined yet"
                      )}
                    </div>
                  </div>
                  <div className="ready-status text-center">
                    <div className="status-label mb-1">Group Status</div>
                    <div className="progress" style={{ height: "20px" }} role="progressbar" 
                         aria-valuenow={readyUsers} 
                         aria-valuemin="0" 
                         aria-valuemax={totalUsers}
                         aria-label={`${readyUsers} of ${totalUsers} users ready`}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${totalUsers ? (readyUsers / totalUsers) * 100 : 0}%` }}
                      >
                        {readyUsers}/{totalUsers}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="fas fa-exclamation-circle me-2" aria-hidden="true"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
              </div>
            )}
            
            {/* Availability Form */}
            <div className="card availability-form mb-4 shadow-sm border-0">
              <div className="card-header bg-light border-0">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2 text-primary"></i>
                  Add New Availability
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <label htmlFor="day_of_week" className="form-label">Day of Week</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-calendar-day"></i>
                        </span>
                        <select
                          className="form-select form-select-lg"
                          id="day_of_week"
                          name="day_of_week"
                          value={formData.day_of_week}
                          onChange={handleInputChange}
                          disabled={isCurrentUserReady}
                          required
                        >
                          <option value="0">Sunday</option>
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <label htmlFor="start_time" className="form-label">Start Time</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-hourglass-start"></i>
                        </span>
                        <input
                          type="time"
                          className="form-control form-control-lg"
                          id="start_time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleInputChange}
                          disabled={isCurrentUserReady}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="end_time" className="form-label">End Time</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-hourglass-end"></i>
                        </span>
                        <input
                          type="time"
                          className="form-control form-control-lg"
                          id="end_time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleInputChange}
                          disabled={isCurrentUserReady}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg transition-hover" 
                      disabled={loading || isCurrentUserReady}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus-circle me-2"></i>
                          Add Availability
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* User's Available Times */}
            <div className="card available-times shadow-sm border-0">
              <div className="card-header bg-light d-flex justify-content-between align-items-center border-0">
                <h5 className="mb-0">
                  <i className="fas fa-list-alt me-2 text-primary"></i>
                  Your Available Times
                </h5>
                <span className="badge bg-secondary rounded-pill">
                  {schedules.length} {schedules.length === 1 ? 'Time Slot' : 'Time Slots'}
                </span>
              </div>
              <div className="card-body">
                {schedules.length === 0 ? (
                  <div className="empty-state text-center p-4">
                    <div className="empty-state-icon mb-3">
                      <i className="fas fa-calendar-times fa-3x text-secondary opacity-50"></i>
                    </div>
                    <p className="text-muted">No available times added yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Day</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map(schedule => (
                          <tr key={schedule.id}>
                            <td>
                              <span className="day-badge">{getDayName(parseInt(schedule.day_of_week))}</span>
                            </td>
                            <td>{formatTime(schedule.start_time)}</td>
                            <td>{formatTime(schedule.end_time)}</td>
                            <td className="text-end">
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleDelete(schedule.id)}
                                disabled={loading || isCurrentUserReady}
                                title="Remove this time slot"
                              >
                                <i className="fas fa-trash-alt me-1"></i>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-footer bg-white border-0 pt-0 pb-3">
                <div className="d-grid mt-3">
                  <button 
                    onClick={handleReadyClick} 
                    className={`btn ${isCurrentUserReady ? 'btn-warning' : 'btn-success'} btn-lg transition-hover`}
                    disabled={schedules.length === 0 || toggling}
                    aria-pressed={isCurrentUserReady ? "true" : "false"}
                  >
                    { toggling ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : isCurrentUserReady ? (
                      <>
                        <i className="fas fa-times-circle me-2" aria-hidden="true"></i>
                        I'm Not Ready Yet - Make Changes
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2" aria-hidden="true"></i>
                        I'm Done Adding My Availability
                      </>
                    )}
                  </button>
                </div>
                {isCurrentUserReady && (
                  <div className="text-center mt-3 text-muted small">
                    <i className="fas fa-info-circle me-1"></i>
                    Waiting for {totalUsers - readyUsers} more {totalUsers - readyUsers === 1 ? 'member' : 'members'} to finish
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ScheduleInput;
