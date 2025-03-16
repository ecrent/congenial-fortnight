import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from './Header';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { registerUser, loading, error } = useContext(SessionContext);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        // Username validation: alphanumeric with underscores and dashes, 3-30 chars
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        errors.name = value.trim() === '' ? 'Username is required' 
                    : !usernameRegex.test(value) ? 'Username must be 3-30 characters and can only contain letters, numbers, underscore, and dash' 
                    : '';
        break;
      
      case 'email':
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        errors.email = value.trim() === '' ? 'Email is required' 
                     : !emailRegex.test(value) ? 'Please enter a valid email address' 
                     : '';
        break;
      
      case 'password':
        // Password validation: at least 6 characters
        errors.password = value.trim() === '' ? 'Password is required' 
                        : value.length < 6 ? 'Password must be at least 6 characters long' 
                        : '';
        
        // If confirm password is filled, check if they match
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          errors.confirmPassword = '';
        }
        break;
      
      case 'confirmPassword':
        // Confirm password validation
        errors.confirmPassword = value.trim() === '' ? 'Please confirm your password' 
                               : value !== formData.password ? 'Passwords do not match' 
                               : '';
        break;
      
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    
    // Check if there are any errors
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) return;
    
    const { name, email, password } = formData;
    const user = await registerUser(name, email, password);
    
    if (user) {
      navigate('/join');
    }
  };

  // Check if form is valid
  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.password.trim() !== '' && 
    formData.confirmPassword.trim() !== '' &&
    Object.values(validationErrors).every(error => error === '');

  return (
    <div className="auth-page">
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card shadow">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="registerName" className="form-label">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        id="registerName"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">
                          {validationErrors.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="registerEmail" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        id="registerEmail"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="registerPassword" className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="registerPassword"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">
                          {validationErrors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="registerConfirmPassword" className="form-label">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="registerConfirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                      />
                      {validationErrors.confirmPassword && (
                        <div className="invalid-feedback">
                          {validationErrors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-grid mb-4">
                    <button 
                      type="submit" 
                      className="btn btn-accent btn-lg" 
                      disabled={!isFormValid || loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Register
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="mb-0">
                      Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
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

export default UserRegistration;
