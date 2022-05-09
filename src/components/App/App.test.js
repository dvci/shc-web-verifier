import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import '../../i18nTest';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn()
}));

beforeAll(() => {
  React.useEffect.mockImplementation(() => {});
});

test('renders title', () => {
  React.useState.mockImplementation(jest.requireActual('react').useState);
  render(<App />);
  expect(screen.getByText(/SMART® Health Cards/i)).toBeInTheDocument();
});
