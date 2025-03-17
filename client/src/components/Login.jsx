import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from './Header';
import Footer from './Footer';

const Login = () => {
  // Add useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    password: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // Here you would typically call an API to send a password reset email
    // For now, we'll just simulate a successful request
    setResetSent(true);
    // setTimeout to hide success message after 5 seconds
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
    }, 5000);
  };

  // Check if form is valid
  const isFormValid = name.trim() !== '' && password.length >= 6;
  const isResetFormValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail);

  return (
    <div className="d-flex flex-column min-vh-100 bg-pattern">
      <Header />
      
      <div className="home-container flex-grow-1 py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {!showForgotPassword ? (
              <div className="card login-card">
                <div className="card-body p-4 p-md-5">
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
                    <div className="d-flex justify-content-end mb-3">
                      <button 
                        type="button" 
                        className="btn btn-link text-decoration-none p-0"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="d-grid mt-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading || !isFormValid}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </button>
                    </div>
                  </form>
                  
                  <div className="text-center mt-4">
                    <p className="mb-0">Don't have an account? <Link to="/register">Register here</Link></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card login-card">
                <div className="card-body p-4 p-md-5">
                  <h2 className="text-center mb-4">Reset Password</h2>
                  
                  {resetSent && (
                    <div className="alert alert-success">
                      Password reset link has been sent to your email.
                    </div>
                  )}
                  
                  <p className="text-center text-muted mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                      <label htmlFor="resetEmail" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="resetEmail"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={!isResetFormValid}
                      >
                        Send Reset Link
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
