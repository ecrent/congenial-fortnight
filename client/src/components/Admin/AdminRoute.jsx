import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';

/**
 * Higher-Order Component that protects admin routes
 * Redirects non-admin users to the home page
 */
const AdminRoute = ({ children }) => {
  const { user, initialLoading } = useContext(SessionContext);
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Only check after the initial loading is complete
    if (!initialLoading) {
      // If the user is not logged in or not an admin, redirect to the home page
      if (!user) {
        setAuthError('No user found. Please log in.');
        setTimeout(() => navigate('/login'), 3000);
      } else if (user.role !== 'admin') {
        setAuthError('You do not have admin privileges.');
        setTimeout(() => navigate('/'), 3000);
      }
    }
  }, [user, navigate, initialLoading]);

  // Show a loading indicator while checking authentication
  if (initialLoading) {
    return <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Verifying authentication...</p>
    </div>;
  }

  // Show error if authentication fails
  if (authError) {
    return <div className="alert alert-danger text-center my-5">
      <p>{authError}</p>
      <p>Redirecting you in a few seconds...</p>
    </div>;
  }

  // Only render the children if the user is an admin
  return user && user.role === 'admin' ? children : null;
};

export default AdminRoute;
