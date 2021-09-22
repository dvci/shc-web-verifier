import React from 'react';
import axios from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import HealthCardVerify from './HealthCardVerify';

const jwks = {
  keys: [
    {
      kty: 'EC',
      kid: '3Kfdg-XwP-7gXyywtUfUADwBumDOPKMQx-iELL11W9s',
      use: 'sig',
      alg: 'ES256',
      crv: 'P-256',
      x: '11XvRWy1I2S0EyJlyf_bWfw_TQ5CJJNLw78bHXNxcgw',
      y: 'eZXwxvO1hvCY0KucrPfKo7yAyMT6Ajc3N7OkAB6VYy8'
    }
  ]
}

const vc = {
  jws: 'eyJ6aXAiOiJERUYiLCJhbGciOiJFUzI1NiIsImtpZCI6IjNLZmRnLVh3UC03Z1h5eXd0VWZVQUR3QnVtRE9QS01ReC1pRUxMMTFXOXMifQ.1ZJNT8JAEIb_y3gt_UoA25voRU8mohfDYbsd6JrtttmPBiT9784uGIhIPNvbtO88874z3YMwBkporO1NmSSmRx6blmnbIJO2iTnTtUlwy9peoklI7VBDBKpaQ5nN8tt8VkyLWQQDh3IPdtcjlO8n3k_UzaGY-IIw13WSVRqNkxZWEXCNNSormHxx1Qdy62etG6HfUBvRKSiVkzIKrxZO1RJPZoB3UlKLl0VAFL0jh9ROHa9akoDmdE5zLFMSfBceoFiLBy1rhaQ2uFPE1CagNmJA5cM-dY2vFzGsRjJbCYrywKyfnRXTbJJmk_wcvTz4emZWkB0Yx-hXN9kPN8Yy60wI5I9h0S9wYJwLhfddHTS8q4XaBM9mZyy2x9vSihs5jzu9SfyOEiPqhA9bAvDQCXk6h3E1RtAfXRFM4xo1Kj_9fEck6jh3OnzyOZeiPSDykDXNLrM-tq1T4pOFK1wLnP_TwHnxZ-DVheD4m470fAE.EYlykJhkhPm0eQjmNYqTTkH9TheZ4bKdJS3nDP1jqty1FSV-py2KRRLhK1NOZdcH6WcllRp-RLhFxMhet_IIaQ',
  payload: {
    iss: 'https://spec.smarthealth.cards/examples/issuer',
    nbf: 1628269596,
    vc: {
      type: [
        'https://smarthealth.cards#health-card',
        'https://smarthealth.cards#labresult'
      ],
      credentialSubject: {
        fhirVersion: null,
        fhirBundle: {
          type: 'collection',
          entry: [
            {
              fullUrl: 'resource:0',
              resource: {
                name: [
                  {
                    family: 'Anyperson',
                    given: ['John', 'B.']
                  }
                ],
                birthDate: '1951-01-20',
                resourceType: 'Patient'
              }
            },
            {
              fullUrl: 'resource:1',
              resource: {
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
                resourceType: 'Immunization'
              }
            },
            {
              fullUrl: 'resource:2',
              resource: {
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
                resourceType: 'Immunization'
              }
            }
          ],
          resourceType: 'Bundle'
        }
      }
    }
  }
};

axios.defaults.adapter = require('axios/lib/adapters/http'); // xhr adapter causes network error

const useEffectSpy = jest.spyOn(React, 'useEffect');
let axiosSpy;

beforeEach(() => {
  useEffectSpy.mockImplementation((f) => f());
  axiosSpy = jest.spyOn(axios, 'get'); // resetting spy mock alone insufficient, need to re-initiate
});

afterEach(() => {
  axiosSpy.mockReset();
  axiosSpy.mockRestore();
});

test('renders element', () => {
  useEffectSpy.mockImplementation(() => {});
  render(<HealthCardVerify vc={vc} />);
  const titleElement = screen.getByText(/Verified/i);
  expect(titleElement).toBeInTheDocument();
  screen.debug();
});

test('verifies vc true', async () => {
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  render(<HealthCardVerify vc={vc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc true integration test', async () => {
  render(<HealthCardVerify vc={vc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc false', async () => {
  const falseVc = {
    ...vc,
    jws: 'eyJ6aXAiOiJERUYiLCJhbGciOiJFUzI1NiIsImtpZCI6IjNLZmRnLVh3UC03Z1h5eXd0VWZVQUR3QnVtRE9QS01ReC1pRUxMMTFXOXMifQ.ZJNT8JAEIb_y3gt_UoA25voRU8mohfDYbsd6JrtttmPBiT9784uGIhIPNvbtO88874z3YMwBkporO1NmSSmRx6blmnbIJO2iTnTtUlwy9peoklI7VBDBKpaQ5nN8tt8VkyLWQQDh3IPdtcjlO8n3k_UzaGY-IIw13WSVRqNkxZWEXCNNSormHxx1Qdy62etG6HfUBvRKSiVkzIKrxZO1RJPZoB3UlKLl0VAFL0jh9ROHa9akoDmdE5zLFMSfBceoFiLBy1rhaQ2uFPE1CagNmJA5cM-dY2vFzGsRjJbCYrywKyfnRXTbJJmk_wcvTz4emZWkB0Yx-hXN9kPN8Yy60wI5I9h0S9wYJwLhfddHTS8q4XaBM9mZyy2x9vSihs5jzu9SfyOEiPqhA9bAvDQCXk6h3E1RtAfXRFM4xo1Kj_9fEck6jh3OnzyOZeiPSDykDXNLrM-tq1T4pOFK1wLnP_TwHnxZ-DVheD4m470fAE.EYlykJhkhPm0eQjmNYqTTkH9TheZ4bKdJS3nDP1jqty1FSV-py2KRRLhK1NOZdcH6WcllRp-RLhFxMhet_IIaQ',
  };
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  render(<HealthCardVerify vc={falseVc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('false', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc error invalid issuer url', async () => {
  const falseVc = {
    ...vc,
    payload: {
      ...vc.payload,
      iss: 6
    }
  };
  render(<HealthCardVerify vc={falseVc} />);
  expect(axiosSpy).not.toHaveBeenCalled();
  expect(await screen.findAllByText('Invalid issuer.', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc error non-existent issuer key url', async () => {
  const falseVc = {
    ...vc,
    payload: {
      ...vc.payload,
      iss: 'http://ww.example.com'
    }
  };
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  render(<HealthCardVerify vc={falseVc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('Error retrieving issuer key URL.', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc error 404 issuer key url', async () => {
  const falseVc = {
    ...vc,
    payload: {
      ...vc.payload,
      iss: 'https://spec.smarthealth.cards/issuer/.well-known/jwks.json'
    }
  };
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  render(<HealthCardVerify vc={falseVc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('Error retrieving issuer key URL.', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc error bad keystore', async () => {
  const badJwks = {};
  axiosSpy.mockResolvedValue({ data: badJwks });
  render(<HealthCardVerify vc={vc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('Error processing issuer keys.', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});

test('verifies vc error validating signature', async () => {
  const falseVc = {
    ...vc,
    jws: 3
  };
  axiosSpy.mockResolvedValue({ data: jwks });
  render(<HealthCardVerify vc={falseVc} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('Error validating signature.', {}, { timeout: 3000 })).toHaveLength(1);
  screen.debug();
});
