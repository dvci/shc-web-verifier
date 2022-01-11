import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn()
}))

beforeAll(() => {
  React.useEffect.mockImplementation(() => {});
});

test('renders title', () => {
  React.useState.mockImplementation(jest.requireActual('react').useState);
  render(<App />);
  const titleElement = screen.getByText(/SMART® Health Cards/i);
  expect(titleElement).toBeInTheDocument();
});
