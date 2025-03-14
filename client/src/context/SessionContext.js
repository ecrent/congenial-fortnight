import React, { createContext, useState, useEffect } from 'react';
import Scheduler from '../apis/Scheduler';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  // Core state variables
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // Add initialLoading state

  // Check local storage for existing user and session on component mount
  useEffect(() => {
    const storedSession = localStorage.getItem('info');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData.session);
        setUser(sessionData.user);
      } catch (err) {
        console.error('Error parsing stored session:', err);
        localStorage.removeItem('info');
      }
    }
    setInitialLoading(false); // Mark initial loading as complete
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
      const newUser = response.data.data.user;
      setUser(newUser);
      
      // Store user info in local storage without session
      localStorage.setItem('info', JSON.stringify({
        user: newUser
      }));
      
      return newUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user');
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
      const loggedUser = response.data.data.user;
      setUser(loggedUser);
      
      // Store user info in local storage without session yet
      localStorage.setItem('info', JSON.stringify({
        user: loggedUser
      }));
      
      return loggedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
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
      
      // Update localStorage with both user and session
      localStorage.setItem('info', JSON.stringify({
        session: newSession,
        user
      }));
      
      return newSession;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
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
      
      // Update localStorage with both user and session
      localStorage.setItem('info', JSON.stringify({
        session: joinedSession,
        user
      }));
      
      return joinedSession;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid session code or session expired');
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
      setError(err.response?.data?.message || 'Failed to add availability');
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
      
      // Update user in state
      setUser(updatedUser);
      
      // Update localStorage
      if (session) {
        localStorage.setItem('info', JSON.stringify({
          session,
          user: updatedUser
        }));
      }
      
      return true;
    } catch (err) {
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
      console.error('Error fetching user schedules:', err);
      setError('Failed to fetch your schedules');
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
        localStorage.setItem('info', JSON.stringify({ user }));
      }
      
      return true;
    } catch (err) {
      console.error('Error leaving session:', err);
      return false;
    }
  };

  // Clear session data (logout)
  const clearSession = () => {
    localStorage.removeItem('info');
    setSession(null);
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      user, 
      loading,
      initialLoading, // Add initialLoading to the context value
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
      clearSession 
    }}>
      {children}
    </SessionContext.Provider>
  );
};
