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
      return joinedSession;
    } catch (err) {
      setError('Invalid session code or session expired');
      console.error('Error joining session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register user within a session
  const registerUser = async (name, sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await Scheduler.post(`/sessions/${sessionId}/users`, { name });
      const newUser = response.data.data.user;
      setUser(newUser);
      
      // Store session info in local storage
      localStorage.setItem('sessionInfo', JSON.stringify({
        session,
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
      setUserReady,
      clearSession 
    }}>
      {children}
    </SessionContext.Provider>
  );
};
