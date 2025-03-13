import { render } from '@testing-library/react';
import App from './App';

// Mock the context to avoid router issues in tests
jest.mock('./context/SessionContext', () => ({
  SessionProvider: ({ children }) => children,
  SessionContext: {
    Consumer: ({ children }) => children({}),
  },
}));

// Manual mock for react-router-dom without requireActual
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: () => <div data-testid="route" />,
  Link: ({ to, children }) => <a href={to} data-testid="link">{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}));

test('renders without crashing', () => {
  render(<App />);
  // Basic test - just check if it renders without errors
  expect(true).toBeTruthy();
});
