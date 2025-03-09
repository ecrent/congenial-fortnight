import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../components/Home';

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, className }) => (
    <a href={to} className={className}>{children}</a>
  )
}));

describe('Home Component', () => {
  it('renders header and start scheduling button', () => {
    render(<Home />);
    expect(screen.getByText(/Meeting Time Finder/i)).toBeInTheDocument();
    const button = screen.getByText(/Start Scheduling/i);
    expect(button).toBeInTheDocument();
  });
});
