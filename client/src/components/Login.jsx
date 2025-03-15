import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from './Header';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    password: ''
  });
  const { loginUser, loading, error } = useContext(SessionContext);
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Basic validation for password
    if (value.length > 0 && value.length < 6) {
      setValidationErrors({
        ...validationErrors,
        password: 'Password must be at least 6 characters long'
      });
    } else {
      setValidationErrors({
        ...validationErrors,
        password: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation before submission
    if (password.length < 6) {
      setValidationErrors({
        ...validationErrors,
        password: 'Password must be at least 6 characters long'
      });
      return;
    }
    
    const user = await loginUser(name, password);
    if (user) {
      // Redirect to admin dashboard if user is admin, otherwise to join page
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/join');
      }
    }
  };

  // Check if form is valid
  const isFormValid = name.trim() !== '' && password.length >= 6;

  return (
    <div>
      <Header />
      <div className="card p-4 my-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginName" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="loginName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
              id="loginPassword"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password (min. 6 characters)"
              required
            />
            {validationErrors.password && (
              <div className="invalid-feedback">{validationErrors.password}</div>
            )}
          </div>
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !isFormValid}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
