import axios from 'axios';
import fs from 'fs';

jest.mock('axios');
let iisstandards;

const testEncode = `<?xml version='1.0' encoding='ISO-8859-1'?><CVXCodes>
<CVXInfo><ShortDescription>Adenovirus & types " 4 and 7'</ShortDescription>
<FullVaccinename>Adenovirus, type 4 and type 7, live, oral</FullVaccinename>
<CVXCode>143       </CVXCode>
<Notes>This vaccine is administered as 2 tablets.</Notes>
<Status>Active</Status>
<LastUpdated>3/20/2011</LastUpdated>
</CVXInfo></CVXCodes>`

beforeEach(() => {
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    iisstandards = require('./iisstandards');
  });
});

test('fetches CVX codes', async () => {
  axios.get.mockImplementationOnce(() => ({ data: fs.readFileSync(`${__dirname}/iisstandards_cvx.xml`, 'utf8') }));
  const cvx = await iisstandards.fetchCvx();
  expect(Object.keys(cvx).length).toBeGreaterThan(0);
  expect(cvx['01']).toEqual('DTP');
});

test('fetches tradenames', async () => {
  axios.get.mockImplementationOnce(() => ({ data: fs.readFileSync(`${__dirname}/iisstandards_tradename.xml`, 'utf8') }));
  const tradenames = await iisstandards.fetchTradenames();
  expect(Object.keys(tradenames).length).toBeGreaterThan(0);
});

test('encodes unescaped characters in XML files', async () => {
  axios.get.mockImplementationOnce(() => ({ data: testEncode }));
  const unencoded = await iisstandards.fetchCvx();
  expect(unencoded['143']).toEqual('Adenovirus & types " 4 and 7\'');
});
