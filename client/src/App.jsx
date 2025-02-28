import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import Home from './routes/Home';
import TimetablesPage from './routes/TimetablesPage';
import UpdatePage from './routes/UpdatePage';
import UserPage from './routes/UserPage';
import { TimetablesProvider } from './context/TimetablesContext';  // Updated import

function App() {
  return (
    <TimetablesProvider>
      <div className='container'>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user/timetables" element={<TimetablesPage />} />
            <Route path="/user/timetables/:id/update" element={<UpdatePage />} />
            <Route path="/user" element={<UserPage />} />
          </Routes>
        </Router>
      </div>
    </TimetablesProvider>
  );
}

export default App;