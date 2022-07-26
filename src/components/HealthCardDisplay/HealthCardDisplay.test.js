import React from 'react';
import { render, screen } from '@testing-library/react';
import ThemeProvider from 'components/ThemeProvider';
import { QrDataContext } from 'components/QrDataProvider';
import * as healthCardDataProviders from 'components/HealthCardDataProvider';
import HealthCardDisplay from './HealthCardDisplay';
import '../../i18nTest';

jest.mock('../VaccineCard', () => ({ children }) => <>{children}</>);

const renderHealthCardDisplay = (
  healthCardSupported,
  healthCardSupportedError,
  healthCardVerified,
  healthCardVerifiedError,
  issuerVerified,
  validPrimarySeries,
  qrError,
  matchingDemographicData
) => {
  healthCardDataProviders.useHealthCardDataContext = jest.fn().mockReturnValue({
    healthCardSupported: {
      status: healthCardSupported,
      error: healthCardSupportedError
    },
    healthCardVerified: {
      verified: healthCardVerified,
      error: healthCardVerifiedError
    },
    issuerVerified
  });

  return render(
    <ThemeProvider>
      <QrDataContext.Provider
        value={{
          qrError,
          jws: [],
          validationStatus: { validPrimarySeries, error: null },
          matchingDemographicData
        }}
      >
        <HealthCardDisplay />
      </QrDataContext.Provider>
    </ThemeProvider>
  );
};

const renderHealthCardDisplayNoValidation = (
  healthCardSupported,
  healthCardSupportedError,
  healthCardVerified,
  healthCardVerifiedError,
  issuerVerified,
  qrError
) => {
  healthCardDataProviders.useHealthCardDataContext = jest.fn().mockReturnValue({
    healthCardSupported: {
      status: healthCardSupported,
      error: healthCardSupportedError
    },
    healthCardVerified: {
      verified: healthCardVerified,
      error: healthCardVerifiedError
    },
    issuerVerified
  });

  return render(
    <ThemeProvider>
      <QrDataContext.Provider
        value={{
          qrError,
          jws: [],
          validationStatus: null
        }}
      >
        <HealthCardDisplay />
      </QrDataContext.Provider>
    </ThemeProvider>
  );
};

test('renders health card banner verified', () => {
  renderHealthCardDisplay(true, null, true, null, true, true, null);
  expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid vaccination series/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer recognized/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner partially verified', () => {
  renderHealthCardDisplay(true, null, true, null, false, false, null);
  expect(screen.getByText(/Partially Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer not recognized/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Cannot determine vaccination status/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner series invalid', () => {
  renderHealthCardDisplay(true, null, true, null, true, false, null);
  expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer recognized/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Cannot determine vaccination status/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner invalid', () => {
  renderHealthCardDisplay(false, new Error('UNSUPPORTED'), false, null, false, false, null);
  expect(screen.getByText(/Invalid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner unverified', () => {
  renderHealthCardDisplay(false, null, false, new Error('UNVERIFIED'), false, false, null);
  expect(screen.getByText(/Not verified/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner qr error', () => {
  renderHealthCardDisplay(false, null, false, null, false, false, new Error('UNSUPPORTED_QR_NOT_SHC'));
  expect(screen.getByText(/Invalid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner verified without series status', () => {
  renderHealthCardDisplay(true, null, true, null, true, null, null);
  expect(screen.queryByText(/Valid vaccination series/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Cannot determine vaccination status/i)).not.toBeInTheDocument();
});

test('renders health card banner verified without validation status', () => {
  renderHealthCardDisplayNoValidation(true, null, true, null, true, null);
  expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer recognized/i)).toBeInTheDocument();
  expect(screen.queryByText(/Cannot determine vaccination status/i)).not.toBeInTheDocument();
});

test('renders matching card demographic data warning when demographic data differs between scanned cards', () => {
  renderHealthCardDisplay(true, null, true, null, true, true, null, false);
  expect(screen.queryByText(/Name and\/or date of birth are not consistent across all the scanned cards./i)).toBeInTheDocument();
});

test('does not render matching card demographic data warning when demographic data is the same across scanned cards', () => {
  renderHealthCardDisplay(true, null, true, null, true, true, null, true);
  expect(screen.queryByText(/Name and\/or date of birth are not consistent across all the scanned cards./i)).not.toBeInTheDocument();
});
