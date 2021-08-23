import React from 'react';
import { render, screen } from '@testing-library/react';
import HealthCardDisplay from './HealthCardDisplay';

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
              code: '207'
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
    }
  ]
};

test('renders learn react link', () => {
  render(<HealthCardDisplay patientData={patientData} />);
  const patientName = screen.getByText(/John B. Anyperson/i);
  expect(patientName).toBeInTheDocument();
  const immunizationDate = screen.getByText(/2021-01-01/i);
  expect(immunizationDate).toBeInTheDocument();
});
