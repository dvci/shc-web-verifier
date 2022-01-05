import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import ThemeProvider from 'components/ThemeProvider';
import { QrDataContext } from 'components/QrDataProvider';
import * as qrHelpers from 'utils/qrHelpers';
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

const cvxCodes = `<CVXCodes>
<CVXInfo>
<ShortDescription>SARS-COV-2 (COVID-19) vaccine, UNSPECIFIED</ShortDescription>
<FullVaccinename>SARS-COV-2 (COVID-19) vaccine, UNSPECIFIED</FullVaccinename>
<CVXCode>213 </CVXCode>
<Notes>Unspecified code for COVID-19 not to be used to record patient US administration. May be used to record historic US administration if product not known. CVX code 500 should be used to record Non-US vaccine where product is not known.</Notes>
<Status>Inactive</Status>
<LastUpdated>7/31/2021</LastUpdated>
</CVXInfo>
<CVXInfo>
<ShortDescription>COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose</ShortDescription>
<FullVaccinename>SARS-COV-2 (COVID-19) vaccine, mRNA, spike protein, LNP, preservative free, 30 mcg/0.3mL dose</FullVaccinename>
<CVXCode>208 </CVXCode>
<Notes>FDA BLA 08/23/2021 for adult dose (16+ years). Still under EUA for adolescent doses and presentations. EUA 12/11/2020, 2-dose vaccine. Used to record Pfizer vaccines administered in the US and in non-US locations (includes tradename Comirnaty)</Notes>
<Status>Active</Status>
<LastUpdated>9/10/2021</LastUpdated>
</CVXInfo>
</CVXCodes>`;

jest.mock('axios');

beforeAll(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

afterEach(() => {
  jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
});

const renderHealthCardDisplay = () => {
  qrHelpers.getPatientData = jest.fn().mockReturnValue(patientData);
  return render(
    <ThemeProvider>
      <QrDataContext.Provider
        value={{
          qrCodes: [],
          setQrCode: jest.fn(),
          healthCardVerified: { verified: false, error: null },
          issuerVerified: false,
        }}
      >
        <HealthCardDisplay />
      </QrDataContext.Provider>
    </ThemeProvider>
  );
}

test('renders health card', () => {
  renderHealthCardDisplay();
  const patientName = screen.getByText(/John B. Anyperson/i);
  expect(patientName).toBeInTheDocument();
  const immunizationDate = screen.getByText(/2021-01-01/i);
  expect(immunizationDate).toBeInTheDocument();
});

test('renders health card without performer', () => {
  // Remove performer from immunization
  delete patientData.immunizations[0].resource.performer;
  renderHealthCardDisplay();
  const patientName = screen.getByText(/John B. Anyperson/i);
  expect(patientName).toBeInTheDocument();
  const immunizationDate = screen.getByText(/2021-01-01/i);
  expect(immunizationDate).toBeInTheDocument();
});

test('renders immunization display', async () => {
  React.useEffect.mockRestore();
  await act(async () => {
    renderHealthCardDisplay();
    await axios.get.mockImplementation((url) => {
      if (url === 'iisstandards_tradename.xml') {
        return { data: tradenames };
      }
      return { data: cvxCodes };
    });
    expect(await screen.findAllByText('Pfizer-BioNTech COVID-19 Vaccine (Non-US COMIRNATY)', {}, { timeout: 3000 })).toHaveLength(1);
    expect(screen.getByText('SARS-COV-2 (COVID-19) vaccine, UNSPECIFIED')).toBeInTheDocument();
    screen.debug();
  });
});
