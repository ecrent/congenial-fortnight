import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Header from '../Header';
import AdminMenu from './AdminMenu';

const AdminDashboard = () => {
  const { 
    user, 
    initialLoading, 
    getUsers, 
    getSchedules, 
    getAllSessions 
  } = useContext(SessionContext);
  
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usersCount: 0,
    sessionsCount: 0,
    schedulesCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (initialLoading) return;

    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate, initialLoading]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user || user.role !== 'admin') return;
      
      setLoading(true);
      
      try {
        // Fetch users
        const users = await getUsers();
        
        // Fetch sessions
        const sessions = await getAllSessions();
        
        // Fetch schedules
        const schedules = await getSchedules();
        
        setStats({
          usersCount: users?.length || 0,
          sessionsCount: sessions?.length || 0,
          schedulesCount: schedules?.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchStatistics();
    }
  }, [user, getUsers, getAllSessions, getSchedules]);
  
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
                <h4 className="mb-0">Admin Dashboard</h4>
              </div>
              <div className="card-body">
                <h5 className="card-title">Welcome, {user?.name}</h5>
                <p className="text-muted">System overview</p>
                
                {loading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row mt-4">
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h3 className="display-4">{stats.usersCount}</h3>
                          <p className="text-muted">Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h3 className="display-4">{stats.sessionsCount}</h3>
                          <p className="text-muted">Sessions</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h3 className="display-4">{stats.schedulesCount}</h3>
                          <p className="text-muted">Schedules</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <h5>Quick Actions</h5>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => navigate('/admin/users')}
                    >
                      Manage Users
                    </button>
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => navigate('/admin/schedules')}
                    >
                      Manage Schedules
                    </button>
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => navigate('/admin/sessions')}
                    >
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
