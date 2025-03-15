import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';
import Header from '../components/Header';

const UserRegistration = () => {
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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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
    return !errors[field]; // Return true if field is valid
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    // Update state based on input id
    switch(id) {
      case 'userName':
        setName(value);
        validateField('name', value);
        break;
      case 'userEmail':
        setEmail(value);
        validateField('email', value);
        break;
      case 'userPassword':
        setPassword(value);
        validateField('password', value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    // Only proceed if all validations pass
    if (isNameValid && isEmailValid && isPasswordValid) {
      const newUser = await registerUser(name, email, password);
      if (newUser) {
        navigate('/join');
      }
    }
  };

  // Check if form is valid
  const isFormValid = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== '' &&
    !validationErrors.name &&
    !validationErrors.email &&
    !validationErrors.password;

  return (
    <div>
      <Header />
      <div className="card p-4 my-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Register Your Account</h2>
        
        {apiError && <div className="alert alert-danger">{apiError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="userName" className="form-label">Your Name</label>
            <input
              type="text"
              className={`form-control ${validationErrors.name ? 'is-invalid' : name ? 'is-valid' : ''}`}
              id="userName"
              value={name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
            {validationErrors.name && (
              <div className="invalid-feedback">{validationErrors.name}</div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="userEmail" className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${validationErrors.email ? 'is-invalid' : email ? 'is-valid' : ''}`}
              id="userEmail"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <div className="invalid-feedback">{validationErrors.email}</div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="userPassword" className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${validationErrors.password ? 'is-invalid' : password ? 'is-valid' : ''}`}
              id="userPassword"
              value={password}
              onChange={handleInputChange}
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
              {loading ? 'Registering...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
