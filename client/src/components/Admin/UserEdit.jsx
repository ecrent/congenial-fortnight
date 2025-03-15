import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Header from '../Header';
import AdminMenu from './AdminMenu';

const UserEdit = () => {
  const { userId } = useParams();
  const { user: currentUser, initialLoading, getUser, updateUser, error: contextError } = useContext(SessionContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '' // Leave empty initially
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Check if current user is admin and redirect if not
  useEffect(() => {
    if (initialLoading) return;

    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate, initialLoading]);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      const userData = await getUser(userId);
      
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          password: '' // Password field is always empty initially
        });
      } else {
        navigate('/admin/users');
      }
      
      setLoading(false);
    };

    if (currentUser && currentUser.role === 'admin' && userId) {
      loadUser();
    }
  }, [currentUser, userId, getUser, navigate]);

  // Show context errors
  useEffect(() => {
    if (contextError) {
      setStatusMessage(contextError);
      setStatusType('danger');
    }
  }, [contextError]);

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'name':
        if (value.trim().length < 3 || value.trim().length > 30) {
          errors.name = 'Name must be between 3 and 30 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          errors.name = 'Name can only contain letters, numbers, underscores, and hyphens';
        } else {
          delete errors.name;
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (value.length > 0 && value.length < 6) {
          errors.password = 'Password must be at least 6 characters long';
        } else {
          delete errors.password;
        }
        break;

      case 'role':
        if (!['admin', 'user'].includes(value)) {
          errors.role = 'Role must be either "admin" or "user"';
        } else {
          delete errors.role;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return !errors[name]; // Return true if field is valid
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    for (const [field, value] of Object.entries(formData)) {
      // Skip password validation if empty (no password update)
      if (field === 'password' && value === '') continue;
      if (!validateField(field, value)) {
        isValid = false;
      }
    }

    if (!isValid) {
      setStatusMessage('Please fix the validation errors.');
      setStatusType('danger');
      return;
    }

    // Prepare data for API
    const updateData = { ...formData };
    
    // Remove empty password from submission
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUser(userId, updateData);
      
      if (updatedUser) {
        setStatusMessage('User updated successfully.');
        setStatusType('success');
        setUser(updatedUser);
        // Clear password field after successful update
        setFormData(prev => ({
          ...prev,
          password: ''
        }));
      }
    } catch (error) {
      setStatusMessage('Failed to update user.');
      setStatusType('danger');
    } finally {
      setSaving(false);
    }
  };

  // If still loading initial data, show loading indicator
  if (initialLoading || loading) {
    return <div className="text-center my-5">Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Edit User</h4>
                <button 
                  className="btn btn-sm btn-light"
                  onClick={() => navigate('/admin/users')}
                >
                  Back to Users
                </button>
              </div>
              <div className="card-body">
                {statusMessage && (
                  <div className={`alert alert-${statusType} alert-dismissible fade show`}>
                    {statusMessage}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setStatusMessage('')}
                    ></button>
                  </div>
                )}
                
                {user && (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Username</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">{validationErrors.name}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">{validationErrors.email}</div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className={`form-select ${validationErrors.role ? 'is-invalid' : ''}`}
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        // Disable changing your own role to prevent self-demotion
                        disabled={parseInt(userId) === currentUser.id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {validationErrors.role && (
                        <div className="invalid-feedback">{validationErrors.role}</div>
                      )}
                      {parseInt(userId) === currentUser.id && (
                        <div className="form-text text-muted">
                          You cannot change your own role.
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                      />
                      {validationErrors.password && (
                        <div className="invalid-feedback">{validationErrors.password}</div>
                      )}
                      <div className="form-text">
                        Leave blank to keep current password.
                      </div>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={saving || Object.keys(validationErrors).length > 0}
                      >
                        {saving ? 'Saving...' : 'Update User'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;
