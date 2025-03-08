import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import Home from './components/Home';
import { SessionProvider } from './context/SessionContext';

// Import new components
import SessionJoin from './components/SessionJoin';
import UserRegistration from './components/UserRegistration';
import ScheduleInput from './components/ScheduleInput';
import Results from './components/Results';

function App() {
  return (
    <SessionProvider>
      <div className='container'>
        <Router>
          <Routes>
            {/* Original routes */}
            <Route path="/" element={<Home />} />
            
            {/* New scheduling routes */}
            <Route path="/join" element={<SessionJoin />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route path="/schedule" element={<ScheduleInput />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </Router>
      </div>
    </SessionProvider>
  );
}

export default App;