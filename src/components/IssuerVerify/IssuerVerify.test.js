import React from 'react';
import axios from 'axios';
import {
  render, screen, waitFor
} from '@testing-library/react';
import { QrDataContext } from 'components/QrDataProvider';
import * as qrHelpers from 'utils/qrHelpers';
import IssuerVerify from './IssuerVerify';

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

const renderIssuerVerify = ({ issValue = iss }) => {
  qrHelpers.getIssuer = jest.fn().mockReturnValue(issValue);
  return render(
    <QrDataContext.Provider value={{ qrCode: '', setQrCode: jest.fn() }}>
      <IssuerVerify />
    </QrDataContext.Provider>
  );
}

test('verifies issuer true', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  renderIssuerVerify({});
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
});

test.skip('verifies issuer true integration test', async () => {
  renderIssuerVerify({ issValue: 'https://myvaccinerecord.cdph.ca.gov/creds' });
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('true', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies issuer false', async () => {
  axiosSpy.mockResolvedValueOnce({ data: directory });
  renderIssuerVerify({ issValue: 'https://myvaccinerecord.cdph.ca.gov/creds' });
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('false', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies error bad directory format', async () => {
  const badDirectory = {};
  axiosSpy.mockResolvedValueOnce({ data: badDirectory });
  renderIssuerVerify({});
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('VCI: Incorrect issuer directory format.', {}, { timeout: 3000 })).toHaveLength(1);
});

test('verifies error bad directory URL', async () => {
  axiosSpy.mockRejectedValueOnce(new Error('Bad URL'));
  renderIssuerVerify({});
  await waitFor(() => expect(axiosSpy).toHaveBeenCalledTimes(1));
  expect(await screen.findAllByText('VCI: Error fetching issuer directory.', {}, { timeout: 3000 })).toHaveLength(1);
});
