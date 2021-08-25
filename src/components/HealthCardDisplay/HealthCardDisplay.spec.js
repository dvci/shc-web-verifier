import React from 'react';
import { render, screen } from '@testing-library/react';
import HealthCardDisplay from './HealthCardDisplay';
import axios from 'axios';
import { act } from "react-dom/test-utils";

jest.mock('axios');

it('renders immunization display', async () => {
    const resp = {data: tradenames};

    await act(async () => {
        await axios.get.mockResolvedValue(resp);
        render(<HealthCardDisplay patientData={qrData} />);  
        expect(await screen.findAllByText("Pfizer-BioNTech COVID-19 Vaccine (Non-US COMIRNATY)", {}, { timeout: 3000 })).toHaveLength(2);
        screen.debug();
      });
  });

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

const qrData = {
    "name": " Jane C. Anyperson ",
    "dateOfBirth": "1961-01-20",
    "immunizations": [
        {
            "meta": {
                "security": [
                    {
                        "system": "https://smarthealth.cards/ial",
                        "code": "IAL2"
                    }
                ]
            },
            "status": "completed",
            "vaccineCode": {
                "coding": [
                    {
                        "system": "http://hl7.org/fhir/sid/cvx",
                        "code": "208"
                    }
                ]
            },
            "patient": {
                "reference": "resource:0"
            },
            "occurrenceDateTime": "2021-01-01",
            "lotNumber": "0000002",
            "performer": [
                {
                    "actor": {
                        "display": "ABC General Hospital"
                    }
                }
            ],
            "resourceType": "Immunization"
        },
        {
            "status": "completed",
            "vaccineCode": {
                "coding": [
                    {
                        "system": "http://hl7.org/fhir/sid/cvx",
                        "code": "208"
                    }
                ]
            },
            "patient": {
                "reference": "resource:0"
            },
            "occurrenceDateTime": "2021-01-29",
            "lotNumber": "0000008",
            "performer": [
                {
                    "actor": {
                        "display": "ABC General Hospital"
                    }
                }
            ],
            "resourceType": "Immunization"
        }
    ]
};