import React from 'react';
import { render } from '@testing-library/react';
import { SessionContext, SessionProvider } from '../context/SessionContext';

// Mock the entire Scheduler module instead of axios
jest.mock('../apis/Scheduler', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { data: {} } }),
    get: jest.fn().mockResolvedValue({ data: { data: {} } }),
    put: jest.fn().mockResolvedValue({ data: { data: {} } })
  }
}));

describe('SessionContext', () => {
  it('provides default context values', () => {
    let contextValue;
    render(
      <SessionProvider>
        <SessionContext.Consumer>
          {value => {
            contextValue = value;
            return null;
          }}
        </SessionContext.Consumer>
      </SessionProvider>
    );

    expect(contextValue.session).toBeNull();
    expect(contextValue.user).toBeNull();
    expect(contextValue.loading).toBeFalsy();
    expect(contextValue.error).toBeNull();
  });

  // Additional tests for createSession, joinSession, etc.
});
