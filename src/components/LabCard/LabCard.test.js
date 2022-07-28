import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ThemeProvider from 'components/ThemeProvider';
import { HealthCardDataContext } from 'components/HealthCardDataProvider';
import * as qrHelpers from 'utils/qrHelpers';
import LabCard from './LabCard';
import '../../i18nTest';

const exampleLab = {
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
};

const exampleLabReferenceRangeLow = {
  ...exampleLab,
  resource: {
    ...exampleLab.resource,
    referenceRange: [
      {
        low: {
          value: 3.1,
          unit: 'mmol/l'
        }
      }
    ]
  }
};

const exampleLabReferenceRangeHigh = {
  ...exampleLab,
  resource: {
    ...exampleLab.resource,
    referenceRange: [
      {
        high: {
          value: 6.2,
          unit: 'mmol/l'
        }
      }
    ]
  }
};

const exampleLabReferenceRangeLowAndHigh = {
  ...exampleLab,
  resource: {
    ...exampleLab.resource,
    referenceRange: [
      {
        low: {
          value: 3.1,
          unit: 'mmol/l'
        },
        high: {
          value: 6.2,
          unit: 'mmol/l'
        }
      }
    ]
  }
};

const patientData = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  labResults: [
    exampleLab
  ]
};

const patientDataReferenceRangeLow = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  labResults: [
    exampleLabReferenceRangeLow
  ]
}

const patientDataReferenceRangeHigh = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  labResults: [
    exampleLabReferenceRangeHigh
  ]
}

const patientDataReferenceRangeLowAndHigh = {
  name: 'John B. Anyperson',
  dateOfBirth: '1951-01-20',
  labResults: [
    exampleLabReferenceRangeLowAndHigh
  ]
}

const renderHealthCardDisplay = (patient) => {
  qrHelpers.getPatientData = jest.fn().mockReturnValue(patient);
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
    renderHealthCardDisplay(patientData);
    expect(await screen.findAllByText(/John B. Anyperson/i, {}, { timeout: 3000 })).toHaveLength(1);
    expect(screen.getByText(/2022-03-01/i)).toBeInTheDocument();
  });
});

test('renders lab result display', async () => {
  await act(async () => {
    renderHealthCardDisplay(patientData);
    expect(
      await screen.findAllByText('SARS-CoV-2 (COVID-19) RNA panel - Unspecified specimen by NAA with probe detection', {}, { timeout: 3000 })
    ).toHaveLength(1);
    expect(screen.getByText('Positive (qualifier value)')).toBeInTheDocument();
  });
});

test('renders reference range text and performer', async () => {
  await act(async () => {
    renderHealthCardDisplay(patientData);
    expect(
      await screen.findAllByText('Detected', {}, { timeout: 3000 })
    ).toHaveLength(1);
    expect(screen.getByText('Example Lab Performer')).toBeInTheDocument();
  });
});

test('render reference range low quantity', async () => {
  await act(async () => {
    renderHealthCardDisplay(patientDataReferenceRangeLow);
    expect(
      await screen.findAllByText('>= 3.1 mmol/l', {}, { timeout: 3000 })
    ).toHaveLength(1);
  });
});

test('render reference range high quantity', async () => {
  await act(async () => {
    renderHealthCardDisplay(patientDataReferenceRangeHigh);
    expect(
      await screen.findAllByText('<= 6.2 mmol/l', {}, { timeout: 3000 })
    ).toHaveLength(1);
  });
});

test('render reference range low and high quantity', async () => {
  await act(async () => {
    renderHealthCardDisplay(patientDataReferenceRangeLowAndHigh);
    expect(
      await screen.findAllByText('3.1 mmol/l - 6.2 mmol/l', {}, { timeout: 3000 })
    ).toHaveLength(1);
  });
});

test('renders health card without performer', async () => {
  // Remove performer from observation
  delete patientData.labResults[0].resource.performer;
  await act(async () => {
    renderHealthCardDisplay(patientData);
    expect(await screen.findAllByText(/John B. Anyperson/i, {}, { timeout: 3000 })).toHaveLength(1);
    expect(screen.getByText(/2022-03-01/i)).toBeInTheDocument();
  });
});

test('does not render missing performer or reference range', async () => {
  // remove referenceRange from observation
  delete patientData.labResults[0].resource.referenceRange;
  await act(async () => {
    renderHealthCardDisplay(patientData);
    expect(screen.queryAllByText('Example Lab Performer')).toHaveLength(0);
    expect(screen.queryByText('Detected')).toBeNull();
  });
});
