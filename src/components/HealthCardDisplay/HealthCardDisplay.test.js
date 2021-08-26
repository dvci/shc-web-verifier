import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
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
    }
  ]
};

const tradenames = `<productnames>
<prodInfo>
<Name>CDC Product Name</Name>
<Value>Moderna COVID-19 Vaccine (non-US Spikevax)</Value>
<Name>Short Description</Name>
<Value>COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5 mL dose</Value>
<Name>CVXCode</Name>
<Value>207 </Value>
<Name>Manufacturer</Name>
<Value>Moderna US, Inc.</Value>
<Name>MVX Code</Name>
<Value>MOD </Value>
<Name>MVX Status</Name>
<Value>Active</Value>
<Name>Product name Status</Name>
<Value>Active</Value>
<Name>Last Updated</Name>
<Value>7/13/2021</Value>
</prodInfo>
<prodInfo>
<Name>CDC Product Name</Name>
<Value>Pfizer-BioNTech COVID-19 Vaccine (Non-US COMIRNATY)</Value>
<Name>Short Description</Name>
<Value>COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose</Value>
<Name>CVXCode</Name>
<Value>208 </Value>
<Name>Manufacturer</Name>
<Value>Pfizer, Inc</Value>
<Name>MVX Code</Name>
<Value>PFR </Value>
<Name>MVX Status</Name>
<Value>Active</Value>
<Name>Product name Status</Name>
<Value>Active</Value>
<Name>Last Updated</Name>
<Value>7/12/2021</Value>
</prodInfo>
</productnames>`;

jest.mock('axios');

beforeAll(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

afterEach(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

test('renders health card', () => {
  render(<HealthCardDisplay patientData={patientData} />);
  const patientName = screen.getByText(/John B. Anyperson/i);
  expect(patientName).toBeInTheDocument();
  const immunizationDate = screen.getByText(/2021-01-01/i);
  expect(immunizationDate).toBeInTheDocument();
});

test('renders health card without performer', () => {
  // Remove performer from immunization
  delete patientData.immunizations[0].resource.performer;
  render(<HealthCardDisplay patientData={patientData} />);
  const patientName = screen.getByText(/John B. Anyperson/i);
  expect(patientName).toBeInTheDocument();
  const immunizationDate = screen.getByText(/2021-01-01/i);
  expect(immunizationDate).toBeInTheDocument();
});

test('renders immunization display', async () => {
  React.useEffect.mockRestore();
  await act(async () => {
    render(<HealthCardDisplay patientData={patientData} />);
    await axios.get.mockResolvedValue({ data: tradenames });
    expect(await screen.findAllByText('Pfizer-BioNTech COVID-19 Vaccine (Non-US COMIRNATY)', {}, { timeout: 3000 })).toHaveLength(1);
    screen.debug();
  });
});
