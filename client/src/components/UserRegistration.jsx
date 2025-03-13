import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const UserRegistration = () => {
  const { registerUser, loading } = useContext(SessionContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    // Register the user (no session info) and then navigate to join page.
    const newUser = await registerUser(name, email, password);
    if (newUser) {
      navigate('/join'); // After registration, user is directed to the join session page
    }
  };

  return (
    <div>
      <Header />
      <div className="card p-4 my-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Register Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="userName" className="form-label">Your Name</label>
            <input
              type="text"
              className="form-control"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userEmail" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="userEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userPassword" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="userPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !name.trim() || !email.trim() || !password.trim()}
            >
              {loading ? 'Registering...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
