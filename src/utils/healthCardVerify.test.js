import axios from 'axios';
import https from 'https';
import { healthCardVerify } from './verifyHelpers';

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

const jws = 'eyJ6aXAiOiJERUYiLCJhbGciOiJFUzI1NiIsImtpZCI6IjNLZmRnLVh3UC03Z1h5eXd0VWZVQUR3QnVtRE9QS01ReC1pRUxMMTFXOXMifQ.1ZJNT8JAEIb_y3gt_UoA25voRU8mohfDYbsd6JrtttmPBiT9784uGIhIPNvbtO88874z3YMwBkporO1NmSSmRx6blmnbIJO2iTnTtUlwy9peoklI7VBDBKpaQ5nN8tt8VkyLWQQDh3IPdtcjlO8n3k_UzaGY-IIw13WSVRqNkxZWEXCNNSormHxx1Qdy62etG6HfUBvRKSiVkzIKrxZO1RJPZoB3UlKLl0VAFL0jh9ROHa9akoDmdE5zLFMSfBceoFiLBy1rhaQ2uFPE1CagNmJA5cM-dY2vFzGsRjJbCYrywKyfnRXTbJJmk_wcvTz4emZWkB0Yx-hXN9kPN8Yy60wI5I9h0S9wYJwLhfddHTS8q4XaBM9mZyy2x9vSihs5jzu9SfyOEiPqhA9bAvDQCXk6h3E1RtAfXRFM4xo1Kj_9fEck6jh3OnzyOZeiPSDykDXNLrM-tq1T4pOFK1wLnP_TwHnxZ-DVheD4m470fAE.EYlykJhkhPm0eQjmNYqTTkH9TheZ4bKdJS3nDP1jqty1FSV-py2KRRLhK1NOZdcH6WcllRp-RLhFxMhet_IIaQ';
const iss = 'https://spec.smarthealth.cards/examples/issuer';

axios.defaults.adapter = require('axios/lib/adapters/http'); // xhr adapter causes network error

let axiosSpy;

beforeEach(() => {
  axiosSpy = jest.spyOn(axios, 'get'); // resetting spy mock alone insufficient, need to re-initiate
});

afterEach(() => {
  axiosSpy.mockReset();
  axiosSpy.mockRestore();
});

const callHealthCardVerify = async ({ jwsValue = jws, issValue = iss }) => {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  return healthCardVerify(agent, jwsValue, issValue);
}

test('verifies vc true', async () => {
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  const verify = callHealthCardVerify({});
  expect(axiosSpy).toHaveBeenCalledTimes(1);
  expect(verify).toBeTruthy();
});

test('verifies vc false', async () => {
  const falseJws = 'eyJ6aXAiOiJERUYiLCJhbGciOiJFUzI1NiIsImtpZCI6IjNLZmRnLVh3UC03Z1h5eXd0VWZVQUR3QnVtRE9QS01ReC1pRUxMMTFXOXMifQ.ZJNT8JAEIb_y3gt_UoA25voRU8mohfDYbsd6JrtttmPBiT9784uGIhIPNvbtO88874z3YMwBkporO1NmSSmRx6blmnbIJO2iTnTtUlwy9peoklI7VBDBKpaQ5nN8tt8VkyLWQQDh3IPdtcjlO8n3k_UzaGY-IIw13WSVRqNkxZWEXCNNSormHxx1Qdy62etG6HfUBvRKSiVkzIKrxZO1RJPZoB3UlKLl0VAFL0jh9ROHa9akoDmdE5zLFMSfBceoFiLBy1rhaQ2uFPE1CagNmJA5cM-dY2vFzGsRjJbCYrywKyfnRXTbJJmk_wcvTz4emZWkB0Yx-hXN9kPN8Yy60wI5I9h0S9wYJwLhfddHTS8q4XaBM9mZyy2x9vSihs5jzu9SfyOEiPqhA9bAvDQCXk6h3E1RtAfXRFM4xo1Kj_9fEck6jh3OnzyOZeiPSDykDXNLrM-tq1T4pOFK1wLnP_TwHnxZ-DVheD4m470fAE.EYlykJhkhPm0eQjmNYqTTkH9TheZ4bKdJS3nDP1jqty1FSV-py2KRRLhK1NOZdcH6WcllRp-RLhFxMhet_IIaQ';
  axiosSpy.mockResolvedValueOnce({ data: jwks });
  const verify = await callHealthCardVerify({ jwsValue: falseJws });
  expect(axiosSpy).toHaveBeenCalledTimes(1);
  expect(verify).toBeFalsy();
});

test('verifies vc error invalid issuer url', async () => {
  const falseIss = 6;
  await expect(callHealthCardVerify({ issValue: falseIss }))
    .rejects
    .toThrow('Invalid issuer.')
  expect(axiosSpy).not.toHaveBeenCalled();
});

test('verifies vc error non-existent issuer key url', async () => {
  const falseIss = 'http://ww.example.com';
  await expect(callHealthCardVerify({ issValue: falseIss }))
    .rejects
    .toThrow('Error retrieving issuer key URL.')
  expect(axiosSpy).toHaveBeenCalledTimes(1);
});

test('verifies vc error 404 issuer key url', async () => {
  const falseIss = 'https://spec.smarthealth.cards/issuer/.well-known/jwks.json';
  await expect(callHealthCardVerify({ issValue: falseIss }))
    .rejects
    .toThrow('Error retrieving issuer key URL.')
  expect(axiosSpy).toHaveBeenCalledTimes(1);
});

test('verifies vc error bad keystore', async () => {
  const badJwks = {};
  axiosSpy.mockResolvedValue({ data: badJwks });
  await expect(callHealthCardVerify({}))
    .rejects
    .toThrow('Error processing issuer keys.')
  expect(axiosSpy).toHaveBeenCalledTimes(1);
});

test('verifies vc error validating signature', async () => {
  const falseJws = 3;
  axiosSpy.mockResolvedValue({ data: jwks });
  await expect(callHealthCardVerify({ jwsValue: falseJws }))
    .rejects
    .toThrow('Error validating signature.')
  expect(axiosSpy).toHaveBeenCalledTimes(1);
});
