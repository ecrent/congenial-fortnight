import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders the header with the correct text', () => {
    render(<Header />);
    const headerElement = screen.getByText(/Meeting Time Finder/i);
    expect(headerElement).toBeInTheDocument();
  });
});
