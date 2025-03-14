import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Scheduler from '../../apis/Scheduler';
import Header from '../Header';
import UserManagement from './UserManagement';
import SessionManagement from './SessionManagement';

const AdminDashboard = () => {
  const { user, initialLoading } = useContext(SessionContext);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  
  // Check if user is admin
  useEffect(() => {
    if (initialLoading) return; // Wait for session loading to complete
    
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate, initialLoading]);
  
  if (initialLoading) {
    return <div className="text-center my-5">Loading...</div>; // Show loading state while checking localStorage
  }
  
  if (!user || user.role !== 'admin') {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div>
      <Header />
      <div className="container my-4">
        <h2 className="mb-4">Admin Dashboard</h2>
        
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Session Management
            </button>
          </li>
        </ul>
        
        <div className="tab-content">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'sessions' && <SessionManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
