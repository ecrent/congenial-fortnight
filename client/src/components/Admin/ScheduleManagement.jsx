import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Header from '../Header';
import AdminMenu from './AdminMenu';

const ScheduleManagement = () => {
  const { user, initialLoading, getSchedules, deleteSchedule, error: contextError } = useContext(SessionContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionFilter, setSessionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
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
  
  // Load schedules
  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true);
      const filters = {};
      
      if (sessionFilter) {
        filters.session_code = sessionFilter;
      }
      
      if (userFilter) {
        filters.user_name = userFilter;
      }
      
      const schedulesData = await getSchedules(filters);
      if (schedulesData) {
        setSchedules(schedulesData);
      }
      setLoading(false);
    };
    
    if (user && user.role === 'admin') {
      loadSchedules();
    }
  }, [user, sessionFilter, userFilter, getSchedules]);
  
  // Show context errors
  useEffect(() => {
    if (contextError) {
      setStatusMessage(contextError);
      setStatusType('danger');
    }
  }, [contextError]);
  
  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
      const success = await deleteSchedule(scheduleId);
      
      if (success) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        setStatusMessage('Schedule entry deleted successfully.');
        setStatusType('success');
      }
    }
  };
  
  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[parseInt(day)] || 'Unknown';
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
                <h4 className="mb-0">Schedule Management</h4>
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
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="sessionFilter" className="form-label">Filter by Session Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="sessionFilter"
                        value={sessionFilter}
                        onChange={(e) => setSessionFilter(e.target.value.toUpperCase())}
                        placeholder="Enter session code"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="userFilter" className="form-label">Filter by User</label>
                      <input
                        type="text"
                        className="form-control"
                        id="userFilter"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading schedules...</span>
                    </div>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="alert alert-info">
                    No schedules found. Try adjusting your filters.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Session</th>
                          <th>Day</th>
                          <th>Time Range</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map(schedule => (
                          <tr key={schedule.id}>
                            <td>{schedule.id}</td>
                            <td>{schedule.user_name}</td>
                            <td>{schedule.session_code}</td>
                            <td>{getDayName(schedule.day_of_week)}</td>
                            <td>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-danger" 
                                onClick={() => handleDelete(schedule.id)}
                              >
                                Delete
                              </button>
                            </td>
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

export default ScheduleManagement;
