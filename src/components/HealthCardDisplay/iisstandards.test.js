import axios from 'axios';
import fs from 'fs';
import { fetchTradenames, fetchCvx } from './iisstandards';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url === 'iisstandards_tradename.xml') {
      return { data: fs.readFileSync(`${__dirname}/iisstandards_tradename.xml`, 'utf8') };
    }
    return { data: fs.readFileSync(`${__dirname}/iisstandards_cvx.xml`, 'utf8') };
  });
});

test('fetches CVX codes', async () => {
  const cvx = await fetchCvx();
  expect(Object.keys(cvx).length).toBeGreaterThan(0);
  expect(cvx['01']).toEqual('DTP');
});

test('fetches tradenames', async () => {
  const tradenames = await fetchTradenames();
  expect(Object.keys(tradenames).length).toBeGreaterThan(0);
});
