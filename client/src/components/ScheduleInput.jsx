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
        setUsersList(response.data.data.users || []);
        
        // If all users are ready, automatically navigate to results
        const allUsers = response.data.data.users || [];
        const readyUsers = allUsers.filter(u => u.is_ready);
        if (allUsers.length > 0 && readyUsers.length === allUsers.length) {
          navigate('/results');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    // Set up polling - every 5 seconds
    const interval = setInterval(fetchUsers, 5000);
    fetchUsers(); // Initial fetch right away
    
    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, [session, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
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
    <div>
      <Header />
      <div className="card p-4 my-4">
        {/* Add back navigation arrow */}
        <div className="d-flex mb-2">
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={handleBackToJoin}
            title="Back to Join Page"
          >
            <i className="fas fa-arrow-left me-1"></i> Back to Join
          </button>
        </div>

        <h2 className="text-center mb-4">Set Your Availability</h2>
        
        <div className="alert alert-info">
          <strong>Session Code:</strong> {session?.session_code} | <strong>Name:</strong> {user?.name}
          <div className="mt-2">
            <strong>Group Status:</strong> {readyUsers} of {totalUsers} members ready
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="day_of_week" className="form-label">Day of Week</label>
              <select
                className="form-select"
                id="day_of_week"
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleInputChange}
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
            <div className="col-md-4">
              <label htmlFor="start_time" className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="end_time" className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || isCurrentUserReady}
            >
              {loading ? 'Adding...' : 'Add Availability'}
            </button>
          </div>
        </form>
        
        <hr className="my-4" />
        
        <h3>Your Available Times</h3>
        {schedules.length === 0 ? (
          <p className="text-center text-muted">No available times added yet</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id}>
                    <td>{getDayName(parseInt(schedule.day_of_week))}</td>
                    <td>{formatTime(schedule.start_time)}</td>
                    <td>{formatTime(schedule.end_time)}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(schedule.id)}
                        disabled={loading || isCurrentUserReady}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="d-grid mt-4">
          <button 
            onClick={handleReadyClick} 
            className={`btn ${isCurrentUserReady ? 'btn-warning' : 'btn-success'}`}
            disabled={schedules.length === 0 || toggling}
          >
            { toggling 
                ? "Processing..." 
                : (isCurrentUserReady 
                    ? "I'm Not Ready Yet - Make Changes" 
                    : "I'm Done Adding My Availability")
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInput;
