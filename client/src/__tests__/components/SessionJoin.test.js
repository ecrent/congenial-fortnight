import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionContext } from '../../context/SessionContext';
import { BrowserRouter } from 'react-router-dom';
import SessionJoin from '../../components/SessionJoin';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SessionJoin Component', () => {
  const mockCreateSession = jest.fn();
  const mockJoinSession = jest.fn();
  const mockGetUserSessions = jest.fn();
  
  const renderWithContext = (contextValue) => {
    return render(
      <SessionContext.Provider value={contextValue}>
        <BrowserRouter>
          <SessionJoin />
        </BrowserRouter>
      </SessionContext.Provider>
    );
  };
  
  beforeEach(() => {
    mockCreateSession.mockReset();
    mockJoinSession.mockReset();
    mockNavigate.mockReset();
    mockGetUserSessions.mockReset();
    mockGetUserSessions.mockResolvedValue([]);
  });
  
  it('should render join and create options', () => {
    renderWithContext({ 
      user: { name: 'testuser' },
      createSession: mockCreateSession,
      joinSession: mockJoinSession,
      getUserSessions: mockGetUserSessions,
      loading: false
    });
    
    expect(screen.getByText(/join existing session/i)).toBeInTheDocument();
    expect(screen.getByText(/create new session/i)).toBeInTheDocument();
  });
  
  it('should call createSession when Create button is clicked', async () => {
    mockCreateSession.mockResolvedValue({ code: 'TEST123' });
    
    renderWithContext({ 
      user: { name: 'testuser' },
      createSession: mockCreateSession,
      joinSession: mockJoinSession,
      getUserSessions: mockGetUserSessions,
      loading: false
    });
    
    fireEvent.click(screen.getByText(/create new session/i));
    
    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/schedule');
    });
  });
});
