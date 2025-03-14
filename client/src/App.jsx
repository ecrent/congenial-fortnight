import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import Home from './components/Home';
import Login from './components/Login'; 
import { SessionProvider } from './context/SessionContext';

import SessionJoin from './components/SessionJoin';
import UserRegistration from './components/UserRegistration';
import ScheduleInput from './components/ScheduleInput';
import Results from './components/Results';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <SessionProvider>
      <div className='container'>
        <Router>
          <Routes>
            {/* Original routes */}
            <Route path="/" element={<Home />} />
            
            {/* New scheduling routes */}
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<SessionJoin />} />
            <Route path="/schedule" element={<ScheduleInput />} />
            <Route path="/results" element={<Results />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </div>
    </SessionProvider>
  );
}

export default App;