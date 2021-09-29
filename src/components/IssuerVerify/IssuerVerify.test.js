import React from 'react';
import axios from 'axios';
import {
  render, screen, waitFor
} from '@testing-library/react';
import IssuerVerify from './IssuerVerify';
import IssuerDirectories from './IssuerDirectories';

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

const getIssuerDirectories = async () => IssuerDirectories.getIssuerDirectories();

test('verifies issuer true', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  const issuerDirectories = await getIssuerDirectories();
  render(<IssuerVerify iss={iss} issuerDirectories={issuerDirectories} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
});

test.skip('verifies issuer true integration test', async () => {
  const issuerDirectories = await getIssuerDirectories();
  render(<IssuerVerify iss="https://myvaccinerecord.cdph.ca.gov/creds" issuerDirectories={issuerDirectories} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies issuer false', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  const issuerDirectories = await getIssuerDirectories();
  render(<IssuerVerify iss="https://myvaccinerecord.cdph.ca.gov/creds" issuerDirectories={issuerDirectories} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('false', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies error bad directory format', async () => {
  const badDirectory = {};
  axiosSpy.mockResolvedValueOnce({ data: badDirectory });
  const issuerDirectories = await getIssuerDirectories();
  render(<IssuerVerify iss={iss} issuerDirectories={issuerDirectories} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('VCI: Incorrect issuer directory format.', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies error bad directory URL', async () => {
  axiosSpy.mockRejectedValueOnce(new Error('Bad URL'));
  const issuerDirectories = await getIssuerDirectories();
  render(<IssuerVerify iss={iss} issuerDirectories={issuerDirectories} />);
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('VCI: Error fetching issuer directory.', {}, { timeout: 3000 })).toHaveLength(1);
});
