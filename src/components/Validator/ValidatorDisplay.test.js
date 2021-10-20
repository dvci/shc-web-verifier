import React from 'react';
import { render, screen } from '@testing-library/react';
import ValidatorDisplay from './ValidatorDisplay';

const patientBundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      fullUrl: 'resource:0',
      resource: {
        resourceType: 'Patient',
        name: [
          {
            family: 'Anyperson',
            given: [
              'John',
              'B.'
            ]
          }
        ],
        birthDate: '1951-01-20'
      }
    },
    {
      fullUrl: 'resource:1',
      resource: {
        resourceType: 'Immunization',
        meta: {
          security: [{ system: 'https://smarthealth.cards/ial', code: 'IAL1.2' }]
        },
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
    },
    {
      fullUrl: 'resource:2',
      resource: {
        resourceType: 'Immunization',
        meta: {
          security: [{ system: 'https://smarthealth.cards/ial', code: 'IAL1.2' }]
        },
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
        occurrenceDateTime: '2021-01-29',
        performer: [
          {
            actor: {
              display: 'ABC General Hospital'
            }
          }
        ],
        lotNumber: '0000007'
      }
    }
  ]
};

test('renders title', () => {
  render(<ValidatorDisplay bundle={patientBundle} action="COVID-19" />);
  const titleElement = screen.getByText(/Validation/i);
  expect(titleElement).toBeInTheDocument();
});
