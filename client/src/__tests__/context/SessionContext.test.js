import { render, act } from '@testing-library/react';
import { SessionContext, SessionProvider } from '../../context/SessionContext';
import React, { useContext } from 'react';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('SessionContext', () => {
  it('should initialize with default values', () => {
    let contextValues;
    
    function TestComponent() {
      contextValues = useContext(SessionContext);
      return null;
    }
    
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );
    
    expect(contextValues.user).toBeNull();
    expect(contextValues.session).toBeNull();
    expect(contextValues.loading).toBeFalsy();
    expect(contextValues.error).toBeNull();
  });
  
  it('should login a user successfully', async () => {
    // Mock implementation
    axios.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          user: { name: 'testuser', email: 'test@example.com' },
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token'
        }
      }
    });
    
    // Test component to trigger the login
    let contextValues;
    function TestComponent() {
      contextValues = useContext(SessionContext);
      return null;
    }
    
    render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );
    
    // Execute the login function
    await act(async () => {
      await contextValues.loginUser('testuser', 'password123');
    });
    
    // Verify user is set
    expect(contextValues.user).toEqual(expect.objectContaining({
      name: 'testuser',
      email: 'test@example.com'
    }));
    expect(contextValues.error).toBeNull();
  });
});
