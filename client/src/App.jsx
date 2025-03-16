import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import Home from './components/Home';
import Login from './components/Login'; 
import { SessionProvider } from './context/SessionContext';
import CookieConsent from './components/CookieConsent';

import SessionJoin from './components/SessionJoin';
import UserRegistration from './components/UserRegistration';
import ScheduleInput from './components/ScheduleInput';
import Results from './components/Results';

// Static pages
import About from './components/static/About';
import Team from './components/static/Team';
import Careers from './components/static/Careers';
import Privacy from './components/static/Privacy';
import Terms from './components/static/Terms';
import Cookies from './components/static/Cookies';

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
      <div className='container-fluid p-0'>
        <Router>
          {/* Skip to content link - visible only when focused */}
          <a 
            href="#main-content" 
            className="skip-link"
            aria-label="Skip to main content"
          >
            Skip to main content
          </a>
          
          <Routes>
            {/* Original routes */}
            <Route path="/" element={<Home />} />
            
            {/* User routes */}
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<SessionJoin />} />
            <Route path="/schedule" element={<ScheduleInput />} />
            <Route path="/results" element={<Results />} />
            
            {/* Static pages */}
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            
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
          <CookieConsent />
        </Router>
      </div>
    </SessionProvider>
  );
}

export default App;