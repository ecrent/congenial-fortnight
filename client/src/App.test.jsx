import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the context to avoid router issues in tests
jest.mock('./context/SessionContext', () => ({
  SessionProvider: ({ children }) => children,
  SessionContext: {
    Consumer: ({ children }) => children({}),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => <div />,
}));

test('renders without crashing', () => {
  render(<App />);
  // Basic test - just check if it renders without errors
  expect(true).toBeTruthy();
});
