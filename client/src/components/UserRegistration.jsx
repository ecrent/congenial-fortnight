import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserRegistration = () => {
  // Add useEffect to scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { registerUser, loading, error: apiError } = useContext(SessionContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Validate form fields as user types
  const validateField = (field, value) => {
    let errors = {...validationErrors};
    
    switch (field) {
      case 'name':
        if (value.trim().length < 3) {
          errors.name = 'Name must be at least 3 characters long';
        } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(value)) {
          errors.name = 'Name can only contain letters, numbers, underscores, and hyphens';
        } else {
          errors.name = '';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          errors.email = '';
        }
        break;
      case 'password':
        if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters long';
        } else {
          errors.password = '';
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update state based on input name
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
    
    // Validate field
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    validateField('name', name);
    validateField('email', email);
    validateField('password', password);
    
    // Check if there are any validation errors
    if (validationErrors.name || validationErrors.email || validationErrors.password) {
      return;
    }
    
    const user = await registerUser(name, email, password);
    if (user) {
      navigate('/join');
    }
  };

  // Check if form is valid
  const isFormValid = 
    name.trim().length >= 3 && 
    /^[a-zA-Z0-9_-]{3,30}$/.test(name) && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && 
    password.length >= 6;

  return (
    <div className="d-flex flex-column min-vh-100 bg-pattern">
      <Header />
      
      <main id="main-content" className="home-container flex-grow-1 py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card register-card">
              <div className="card-body p-4 p-md-5">
                <h1 className="text-center mb-4 h2">Register Your Account</h1>
                
                {apiError && (
                  <div className="alert alert-danger" role="alert">
                    {apiError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="userName" className="form-label">Your Name</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.name ? 'is-invalid' : name ? 'is-valid' : ''}`}
                      id="userName"
                      name="name"
                      value={name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                      aria-required="true"
                      aria-describedby="nameHelp nameFeedback"
                      aria-invalid={validationErrors.name ? "true" : "false"}
                    />
                    <small id="nameHelp" className="form-text text-muted">
                      Use 3-30 characters, letters, numbers, underscores, or hyphens
                    </small>
                    {validationErrors.name && (
                      <div className="invalid-feedback" id="nameFeedback">{validationErrors.name}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="userEmail" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-control ${validationErrors.email ? 'is-invalid' : email ? 'is-valid' : ''}`}
                      id="userEmail"
                      name="email"
                      value={email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      aria-required="true"
                      aria-describedby="emailFeedback"
                      aria-invalid={validationErrors.email ? "true" : "false"}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback" id="emailFeedback">{validationErrors.email}</div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="userPassword" className="form-label">Password</label>
                    <input
                      type="password"
                      className={`form-control ${validationErrors.password ? 'is-invalid' : password ? 'is-valid' : ''}`}
                      id="userPassword"
                      name="password"
                      value={password}
                      onChange={handleInputChange}
                      placeholder="Create a password (min. 6 characters)"
                      required
                      aria-required="true"
                      aria-describedby="passwordHelp passwordFeedback"
                      aria-invalid={validationErrors.password ? "true" : "false"}
                    />
                    <small id="passwordHelp" className="form-text text-muted">
                      Password must be at least 6 characters long
                    </small>
                    {validationErrors.password && (
                      <div className="invalid-feedback" id="passwordFeedback">{validationErrors.password}</div>
                    )}
                  </div>
                  
                  <div className="d-grid mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={loading || !isFormValid}
                      aria-label={loading ? "Registering..." : "Register"}
                      aria-busy={loading ? "true" : "false"}
                    >
                      {loading ? 'Registering...' : 'Continue'}
                    </button>
                  </div>
                </form>
                
                <div className="text-center mt-4">
                  <p className="mb-0">Already have an account? <Link to="/login">Login here</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserRegistration;
