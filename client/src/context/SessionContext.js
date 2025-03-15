import React, { createContext, useState, useEffect } from 'react';
import Scheduler from '../apis/Scheduler';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  // Core state variables
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check session storage for existing user data on component mount
  useEffect(() => {
    const loadUserFromTokens = async () => {
      const accessToken = sessionStorage.getItem('accessToken');
      const userData = sessionStorage.getItem('userData');
      const sessionData = sessionStorage.getItem('sessionData');
      
      // Handle migration from localStorage to sessionStorage (backward compatibility)
      if (!accessToken && localStorage.getItem('info')) {
        try {
          const storedData = JSON.parse(localStorage.getItem('info'));
          if (storedData.user) {
            // We found old localStorage data, set it in the state
            setUser(storedData.user);
            if (storedData.session) {
              setSession(storedData.session);
            }
            
            // We need to get new tokens for this user - must relogin
            setError("Please login again to upgrade your account security");
            
            // Clear old data
            localStorage.removeItem('info');
          }
        } catch (err) {
          console.error('Error parsing localStorage data:', err);
          localStorage.removeItem('info');
        }
      } else if (accessToken && userData) {
        try {
          // Parse the stored user data
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // If there's also session data, parse and set it
          if (sessionData) {
            setSession(JSON.parse(sessionData));
          }
        } catch (err) {
          console.error('Error parsing stored data:', err);
          // Clear invalid data
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('sessionData');
        }
      }
      
      setInitialLoading(false);
    };
    
    loadUserFromTokens();
  }, []);

  // Register a new user (no session needed initially)
  const registerUser = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Call the updated user registration endpoint
      const response = await Scheduler.post('/users/register', { 
        name, 
        email, 
        password 
      });
      
      const { user: newUser, accessToken, refreshToken } = response.data.data;
      
      // Store tokens in sessionStorage (more secure than localStorage)
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      return newUser;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to register user');
      }
      console.error('Error registering user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const loginUser = async (name, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post('/users/login', { name, password });
      const { user: loggedUser, accessToken, refreshToken } = response.data.data;
      
      // Store tokens in sessionStorage
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userData', JSON.stringify(loggedUser));
      
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to log in');
      }
      console.error('Error logging in:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new session
  const createSession = async () => {
    if (!user) {
      setError('You must be logged in to create a session');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post('/sessions');
      const newSession = response.data.data.session;
      setSession(newSession);
      
      // Store session data in sessionStorage
      sessionStorage.setItem('sessionData', JSON.stringify(newSession));
      
      return newSession;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to create session');
      }
      console.error('Error creating session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join existing session by code
  const joinSession = async (sessionCode) => {
    if (!user) {
      setError('You must be logged in to join a session');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.get(`/sessions/${sessionCode}`);
      const joinedSession = response.data.data.session;
      setSession(joinedSession);
      
      // Store session data in sessionStorage
      sessionStorage.setItem('sessionData', JSON.stringify(joinedSession));
      
      return joinedSession;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Invalid session code or session expired');
      }
      console.error('Error joining session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add schedule (availability) for current user in current session
  const addSchedule = async (day_of_week, start_time, end_time) => {
    if (!user || !session) {
      setError('User and session required to add availability');
      return null;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post('/schedules', {
        session_code: session.session_code,
        user_name: user.name,
        day_of_week,
        start_time,
        end_time
      });
      
      return response.data.data.schedule;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to add availability');
      }
      console.error('Error adding schedule:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user ready status - using name instead of ID
  const setUserReady = async (isReady) => {
    if (!user) return false;
    
    try {
      // Updated to use name instead of ID
      const response = await Scheduler.put(`/users/${user.name}/ready`, { isReady });
      const updatedUser = response.data.data.user;
      
      // Update user in state and sessionStorage
      setUser(updatedUser);
      sessionStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return true;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
      console.error('Error updating ready status:', err);
      return false;
    }
  };

  // Get user schedules
  const getUserSchedules = async () => {
    if (!user) {
      setError('User not logged in');
      return [];
    }
    
    try {
      const response = await Scheduler.get(`/schedules/user/${user.name}`);
      return response.data.data.schedules || [];
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError('Failed to fetch your schedules');
      }
      console.error('Error fetching user schedules:', err);
      return [];
    }
  };

  // Get user's active sessions
  const getUserSessions = async () => {
    if (!user) {
      setError('User not logged in');
      return [];
    }
    
    try {
      const response = await Scheduler.get(`/sessions/user/${user.name}`);
      return response.data.data.sessions || [];
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
      console.error('Error fetching user sessions:', err);
      return [];
    }
  };

  // Leave a session
  const leaveSession = async (sessionCode) => {
    if (!user) {
      setError('User not logged in');
      return false;
    }
    
    try {
      await Scheduler.delete(`/sessions/${sessionCode}/users/${user.name}`);
      
      // If the current session is the one being left, clear it
      if (session && session.session_code === sessionCode) {
        setSession(null);
        sessionStorage.removeItem('sessionData');
      }
      
      return true;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'An error occurred');
      }
      console.error('Error leaving session:', err);
      return false;
    }
  };

  // Clear session data (logout)
  const clearSession = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('sessionData');
    setSession(null);
    setUser(null);
  };

  // Admin-specific methods
  const getUsers = async () => {
    console.log('getUsers called, user:', user ? {
      id: user.id,
      name: user.name,
      role: user.role
    } : 'No user');
    
    if (!user || user.role !== 'admin') {
      console.log('Not admin or not logged in');
      setError('Admin privileges required');
      return null;
    }

    try {
      console.log('Making request to /admin/users');
      const response = await Scheduler.get('/admin/users');
      console.log('Response from /admin/users:', response.data);
      return response.data.data.users;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
      console.error('Error fetching users:', err);
      console.log('Error details:', err.response?.data);
      return null;
    }
  };

  const getUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const response = await Scheduler.get(`/admin/users/${userId}`);
      return response.data.data.user;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to fetch user');
      }
      console.error('Error fetching user:', err);
      return null;
    }
  };

  const updateUser = async (userId, userData) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const response = await Scheduler.put(`/admin/users/${userId}`, userData);
      return response.data.data.user;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to update user');
      }
      console.error('Error updating user:', err);
      return null;
    }
  };

  const deleteUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return false;
    }

    try {
      await Scheduler.delete(`/admin/users/${userId}`);
      return true;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
      console.error('Error deleting user:', err);
      return false;
    }
  };

  const updateUserRole = async (userId, role) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const response = await Scheduler.patch(`/admin/users/${userId}/role`, { role });
      return response.data.data.user;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to update user role');
      }
      console.error('Error updating user role:', err);
      return null;
    }
  };

  const getSchedules = async (filters = {}) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.session_code) queryParams.append('session_code', filters.session_code);
      if (filters.user_name) queryParams.append('user_name', filters.user_name);
      
      const url = `/admin/schedules${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await Scheduler.get(url);
      return response.data.data.schedules;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to fetch schedules');
      }
      console.error('Error fetching schedules:', err);
      return null;
    }
  };

  const updateSchedule = async (scheduleId, scheduleData) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const response = await Scheduler.put(`/admin/schedules/${scheduleId}`, scheduleData);
      return response.data.data.schedule;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to update schedule');
      }
      console.error('Error updating schedule:', err);
      return null;
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return false;
    }

    try {
      await Scheduler.delete(`/admin/schedules/${scheduleId}`);
      return true;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to delete schedule');
      }
      console.error('Error deleting schedule:', err);
      return false;
    }
  };

  const getAllSessions = async () => {
    if (!user || user.role !== 'admin') {
      setError('Admin privileges required');
      return null;
    }

    try {
      const response = await Scheduler.get('/admin/sessions');
      return response.data.data.sessions;
    } catch (err) {
      if (!navigator.onLine) {
        setError("You appear to be offline. Please check your internet connection.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please try again later.");
      } else {
        setError(err.response?.data?.message || 'Failed to fetch sessions');
      }
      console.error('Error fetching sessions:', err);
      return null;
    }
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      user, 
      loading,
      initialLoading,
      error,
      registerUser,
      loginUser,
      createSession, 
      joinSession,
      leaveSession,
      getUserSessions,
      addSchedule,
      getUserSchedules,
      setUserReady,
      clearSession,
      // Admin methods
      getUsers,
      getUser,
      updateUser,
      deleteUser,
      updateUserRole,
      getSchedules,
      updateSchedule,
      deleteSchedule,
      getAllSessions
    }}>
      {children}
    </SessionContext.Provider>
  );
};
