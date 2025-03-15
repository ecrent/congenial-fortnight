import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import Home from './components/Home';
import Login from './components/Login'; 
import { SessionProvider } from './context/SessionContext';

import SessionJoin from './components/SessionJoin';
import UserRegistration from './components/UserRegistration';
import ScheduleInput from './components/ScheduleInput';
import Results from './components/Results';

// Admin components
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import UserEdit from './components/Admin/UserEdit';
import ScheduleManagement from './components/Admin/ScheduleManagement';
import SessionManagement from './components/Admin/SessionManagement';

function App() {
  return (
    <SessionProvider>
      <div className='container'>
        <Router>
          <Routes>
            {/* Original routes */}
            <Route path="/" element={<Home />} />
            
            {/* User routes */}
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<SessionJoin />} />
            <Route path="/schedule" element={<ScheduleInput />} />
            <Route path="/results" element={<Results />} />
            
            {/* Admin routes - wrapped with AdminRoute for protection */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            <Route path="/admin/users/:userId" element={
              <AdminRoute>
                <UserEdit />
              </AdminRoute>
            } />
            <Route path="/admin/schedules" element={
              <AdminRoute>
                <ScheduleManagement />
              </AdminRoute>
            } />
            <Route path="/admin/sessions" element={
              <AdminRoute>
                <SessionManagement />
              </AdminRoute>
            } />
          </Routes>
        </Router>
      </div>
    </SessionProvider>
  );
}

export default App;