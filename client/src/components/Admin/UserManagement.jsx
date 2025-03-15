import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import Header from '../Header';
import AdminMenu from './AdminMenu';

const UserManagement = () => {
  const { user: currentUser, getUsers, deleteUser, updateUserRole, error } = useContext(SessionContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const navigate = useNavigate();

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const userData = await getUsers();
      if (userData) {
        setUsers(userData);
      }
      setLoading(false);
    };

    loadUsers();
  }, [getUsers]);

  // Show API errors
  useEffect(() => {
    if (error) {
      setStatusMessage(error);
      setStatusType('danger');
    }
  }, [error]);

  const handleEdit = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      const success = await deleteUser(userId);
      
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
        setStatusMessage(`User ${userName} deleted successfully.`);
        setStatusType('success');
      }
    }
  };

  const handleRoleChange = async (userId, userName, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (window.confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) {
      const updatedUser = await updateUserRole(userId, newRole);
      
      if (updatedUser) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setStatusMessage(`${userName}'s role updated to ${newRole}.`);
        setStatusType('success');
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h4 className="mb-0">User Management</h4>
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
                
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading users...</span>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="alert alert-info">
                    {searchTerm ? 'No users matching your search.' : 'No users found.'}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-primary" 
                                  onClick={() => handleEdit(user.id)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-warning" 
                                  onClick={() => handleRoleChange(user.id, user.name, user.role)}
                                  disabled={user.id === currentUser?.id}
                                >
                                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDelete(user.id, user.name)}
                                  disabled={user.id === currentUser?.id}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
