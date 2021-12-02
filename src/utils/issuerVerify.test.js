import axios from 'axios';
import { issuerVerify } from './verifyHelpers';

const iss = 'https://spec.smarthealth.cards/examples/issuer';
const directory = {
  participating_issuers: [
    {
      iss: 'https://spec.smarthealth.cards/examples/issuer',
      name: 'SMART Spec issuer'
    },
    {
      iss: 'https://example.com',
      name: 'Bad issuer'
    }
  ]
};

axios.defaults.adapter = require('axios/lib/adapters/http'); // xhr adapter causes network error

let axiosSpy;

beforeEach(() => {
  axiosSpy = jest.spyOn(axios, 'get'); // resetting spy mock alone insufficient, need to re-initiate
});

afterEach(() => {
  axiosSpy.mockReset();
  axiosSpy.mockRestore();
});

const callIssuerVerify = async ({ issValue = iss }) => (issuerVerify(issValue));

test('verifies issuer true', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  const verify = await callIssuerVerify({});
  expect(axiosSpy).toHaveBeenCalledTimes(1);
  expect(verify).toBeTruthy();
});

test('verifies issuer false', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  const verify = await callIssuerVerify({ issValue: 'https://myvaccinerecord.cdph.ca.gov/creds' });
  expect(axiosSpy).toHaveBeenCalledTimes(1);
  expect(verify).toBeFalsy();
});
