import axios from 'axios';
import fs from 'fs';
import { fetchTradenames, fetchCvx, encodeEntity } from './iisstandards';

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

test('encodes unescaped characters in XML files', () => {
  const unescapedXmlString = [
    '<?xml version="1.0"?>',
    '<MockXml>',
    '<Ampersand>&</Ampersand>',
    '<Quotation>"</Quotation>',
    '<Apostrophe>\'</Apostrophe>',
    '</MockXml>',
  ].join('\n');
  const encodedXmlString = encodeEntity(unescapedXmlString);
  const escapedLines = encodedXmlString.split('\n');
  expect(escapedLines[0]).toEqual('');
  expect(escapedLines[2]).toEqual('<Ampersand>&amp;</Ampersand>');
  expect(escapedLines[3]).toEqual('<Quotation>&quot;</Quotation>');
  expect(escapedLines[4]).toEqual('<Apostrophe>&apos;</Apostrophe>');
});

test('does not decode escaped ampersand characters in XML file', () => {
  const escapedXmlString = '<Ampersand>&amp;</Ampersand>';
  expect(encodeEntity(escapedXmlString)).toEqual(escapedXmlString)
});
