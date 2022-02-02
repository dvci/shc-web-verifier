import React from 'react';
import { render, screen } from '@testing-library/react';
import ThemeProvider from 'components/ThemeProvider';
import { QrDataContext } from 'components/QrDataProvider';
import * as qrHelpers from 'utils/qrHelpers';
import HealthCardDisplay from './HealthCardDisplay';
import '../../i18nTest';

const patientData = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  immunizations: [
    {
      fullUrl: 'resource:1',
      resource: {
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '208'
            }
          ]
        },
        patient: {
          reference: 'resource:0'
        },
        occurrenceDateTime: '2021-01-01',
        performer: [
          {
            actor: {
              display: 'ABC General Hospital'
            }
          }
        ],
        lotNumber: '0000001'
      }
    },
    {
      fullUrl: 'resource:2',
      resource: {
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/cvx',
              code: '213'
            }
          ]
        },
        patient: {
          reference: 'resource:0'
        },
        occurrenceDateTime: '2021-02-01'
      }
    }
  ]
};

jest.mock('../VaccineCard', () => ({ children }) => <>{children}</>);

beforeAll(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

afterEach(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

const renderHealthCardDisplay = (
  displayPatientData,
  healthCardVerified,
  healthCardVerifiedError,
  issuerVerified,
  validPrimarySeries
) => {
  qrHelpers.getPatientData = jest.fn().mockReturnValue(displayPatientData);
  return render(
    <ThemeProvider>
      <QrDataContext.Provider
        value={{
          qrCodes: [],
          setQrCode: jest.fn(),
          healthCardVerified: { verified: healthCardVerified, error: healthCardVerifiedError },
          issuerVerified,
          validPrimarySeries,
        }}
      >
        <HealthCardDisplay />
      </QrDataContext.Provider>
    </ThemeProvider>
  );
}

test('renders health card banner verified', () => {
  renderHealthCardDisplay(patientData, true, null, true, true);
  expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid vaccination series/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer recognized/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner partially verified', () => {
  renderHealthCardDisplay(patientData, true, null, false, false);
  expect(screen.getByText(/Partially Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer not recognized/i)).toBeInTheDocument();
  expect(screen.getByText(/Vaccination series not valid/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner series invalid', () => {
  renderHealthCardDisplay(patientData, true, null, true, false);
  expect(screen.getByText(/Verified/i)).toBeInTheDocument();
  expect(screen.getByText(/Valid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/Issuer recognized/i)).toBeInTheDocument();
  expect(screen.getByText(/Vaccination series not valid/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});

test('renders health card banner invalid', () => {
  renderHealthCardDisplay(null, false, null, false, false);
  expect(screen.getByText(/Invalid SMART® Health Card/i)).toBeInTheDocument();
  expect(screen.getByText(/SCAN QR CODE/i)).toBeInTheDocument();
});
