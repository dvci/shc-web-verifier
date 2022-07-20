import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ThemeProvider from 'components/ThemeProvider';
import { HealthCardDataContext } from 'components/HealthCardDataProvider';
import * as qrHelpers from 'utils/qrHelpers';
import LabCard from './LabCard';
import '../../i18nTest';

const patientData = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  labResults: [
    {
      fullUrl: 'resource:1',
      resource: {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '94306-8'
            }
          ]
        },
        subject: {
          reference: 'resource:0'
        },
        effectiveDateTime: '2022-03-01',
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '10828004'
            }
          ]
        },
        performer: [
          {
            display: 'Example Lab Performer'
          }
        ],
        referenceRange: [
          {
            text: 'Detected'
          }
        ]
      }
    }
  ]
};

const renderHealthCardDisplay = () => {
  qrHelpers.getPatientData = jest.fn().mockReturnValue(patientData);
  return render(
    <ThemeProvider>
      <HealthCardDataContext.Provider
        value={{
          jws: 'eqowid',
          healthCardSupported: { status: true, error: null },
          healthCardVerified: { verified: false, error: null },
          issuerVerified: false,
          issuerDisplayName: null
        }}
      >
        <LabCard />
      </HealthCardDataContext.Provider>
    </ThemeProvider>
  );
};

test('renders health card', async () => {
  await act(async () => {
    renderHealthCardDisplay();
    expect(await screen.findAllByText(/John B. Anyperson/i, {}, { timeout: 3000 })).toHaveLength(1);
    expect(screen.getByText(/2022-03-01/i)).toBeInTheDocument();
  });
});

test('renders lab result display', async () => {
  await act(async () => {
    renderHealthCardDisplay();
    expect(
      await screen.findAllByText('SARS-CoV-2 (COVID-19) RNA panel - Unspecified specimen by NAA with probe detection', {}, { timeout: 3000 })
    ).toHaveLength(1);
    expect(screen.getByText('Positive (qualifier value)')).toBeInTheDocument();
  });
});

test('renders performer and reference range', async () => {
  await act(async () => {
    renderHealthCardDisplay();
    expect(
      await screen.findAllByText('Detected', {}, { timeout: 3000 })
    ).toHaveLength(1);
    expect(screen.getByText('Example Lab Performer')).toBeInTheDocument();
  });
});

test('renders health card without performer', async () => {
  // Remove performer from observation
  delete patientData.labResults[0].resource.performer;
  await act(async () => {
    renderHealthCardDisplay();
    expect(await screen.findAllByText(/John B. Anyperson/i, {}, { timeout: 3000 })).toHaveLength(1);
    expect(screen.getByText(/2022-03-01/i)).toBeInTheDocument();
  });
});

test('does not render missing performer or reference range', async () => {
  // remove referenceRange from observation
  delete patientData.labResults[0].resource.referenceRange;
  await act(async () => {
    renderHealthCardDisplay();
    expect(screen.queryAllByText('Example Lab Performer')).toHaveLength(0);
    expect(screen.queryByText('Detected')).toBeNull();
  });
});
