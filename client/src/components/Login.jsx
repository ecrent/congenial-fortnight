import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="auth-page">
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card shadow">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="loginName" className="form-label">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="loginName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <label htmlFor="loginPassword" className="form-label">Password</label>
                      <a href="#" className="small text-decoration-none">Forgot Password?</a>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="loginPassword"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter your password"
                        required
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg" 
                      disabled={!isFormValid || loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="mb-0">
                      Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
