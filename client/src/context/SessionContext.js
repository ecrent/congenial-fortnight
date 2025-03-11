import React, { createContext, useState, useEffect } from 'react';
import Scheduler from '../apis/Scheduler';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check local storage for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('sessionInfo');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData.session);
        setUser(sessionData.user);
      } catch (err) {
        console.error('Error parsing stored session:', err);
        localStorage.removeItem('sessionInfo');
      }
    }
  }, []);

  // Create a new session
  const createSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post('/sessions');
      const newSession = response.data.data.session;
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError('Failed to create session');
      console.error('Error creating session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join an existing session
  const joinSession = async (sessionCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.get(`/sessions/${sessionCode}`);
      const joinedSession = response.data.data.session;
      setSession(joinedSession);
      // If a user is logged in, update their record with the joined session id
      if (user) {
        await Scheduler.put(`/users/${user.id}/session`, { session_id: joinedSession.id });
        localStorage.setItem('sessionInfo', JSON.stringify({
          session: joinedSession,
          user: user
        }));
      }
      return joinedSession;
    } catch (err) {
      setError('Invalid session code or session expired');
      console.error('Error joining session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update registerUser to remove session ID dependency.
  const registerUser = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Call the new endpoint that registers the user without session info.
      const response = await Scheduler.post('/users', { name, email, password });
      const newUser = response.data.data.user;
      setUser(newUser);
      
      // Store user info in local storage.
      localStorage.setItem('sessionInfo', JSON.stringify({
        user: newUser
      }));
      
      return newUser;
    } catch (err) {
      setError('Failed to register user');
      console.error('Error registering user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // NEW: Login user function using API endpoint
  const loginUser = async (name, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post('/users/login', { name, password });
      const loggedUser = response.data.data.user;
      setUser(loggedUser);
      // Optionally update local storage
      localStorage.setItem('sessionInfo', JSON.stringify({
        session,
        user: loggedUser
      }));
      return loggedUser;
    } catch (err) {
      setError('Failed to log in');
      console.error('Error logging in:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update user ready status
  const setUserReady = async (isReady) => {
    if (!user) return false;
    
    try {
      const response = await Scheduler.put(`/users/${user.id}/ready`, { isReady });
      const updatedUser = response.data.data.user;
      
      // Update user in state
      setUser(updatedUser);
      
      // Update localStorage
      if (session) {
        localStorage.setItem('sessionInfo', JSON.stringify({
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

  // Clear session data (logout)
  const clearSession = () => {
    localStorage.removeItem('sessionInfo');
    setSession(null);
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      user, 
      loading, 
      error, 
      createSession, 
      joinSession, 
      registerUser,
      loginUser, // <-- added loginUser
      setUserReady,
      clearSession 
    }}>
      {children}
    </SessionContext.Provider>
  );
};
