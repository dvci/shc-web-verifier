import axios from 'axios';
import jose from 'node-jose';
import { verify, ErrorCode, low, Context
} from 'smart-health-card-decoder/src';
import {
  getPatientData
} from 'utils/qrHelpers';
import getIssuerDirectories from './IssuerDirectories';

const healthCardVerify = async (httpsAgent, jws, iss, controller) => {
  let response;
  let verifier;

  const directories = await getIssuerDirectories(controller);
  const result = await verify(jws, directories);
  if (result.context?.signature?.verified) return result.context.signature.verified;

  const isValidated = !(result.context.errors ?? [])
    .filter((logEntry) => logEntry.code < ErrorCode.DIRECTORY_ERROR).length;

  if (!isValidated) {
    throw Error('UNSUPPORTED_MALFORMED_CREDENTIAL');
  }

  try {
    const jwkURL = `${iss}/.well-known/jwks.json`;
    response = await axios.get(jwkURL, { httpsAgent, signal: controller?.signal });
  } catch (err) {
    // network error, incorrect URL or status!=2xx
    throw Error('UNVERIFIED_ERROR_RETRIEVING_KEY_URL');
  }

  try {
    const keySet = await response.data;
    const keyStore = await jose.JWK.asKeyStore(keySet).then((res) => res);
    verifier = jose.JWS.createVerify(keyStore);
  } catch (err) {
    // key format error
    throw Error('UNVERIFIED_ISSUER_KEY_FORMAT_ERROR');
  }

  try {
    return await verifier
      .verify(jws)
      .then(() => true)
      .catch(() => false);
  } catch (err) {
    throw Error('UNVERIFIED_ERROR_VALIDATING_SIGNATURE');
  }
};

const issuerVerify = async (iss, controller) => getIssuerDirectories(controller)
  .then((fetchedDirectories) => {
    if (fetchedDirectories.find(iss)) return true;
    return false;
  })
  .catch(() => false);

const healthCardSupported = (cardJws) => {
  const context = new Context();
  try {
    context.compact = cardJws;
    low.validate.jws.compact(context);
    if (context.errors.length > 0) {
      return {
        status: false,
        error: new Error('UNSUPPORTED_MALFORMED_CREDENTIAL')
      };
    }
  } catch {
    return {
      status: false,
      error: new Error('UNSUPPORTED_MALFORMED_CREDENTIAL')
    };
  }
  const vc = context.jws.payload;
  if (!vc.type.some((type) => type === 'https://smarthealth.cards#health-card')) {
    return {
      status: false,
      error: new Error('UNSUPPORTED_CREDENTIAL')
    };
  }

  if (!vc.type.some((type) => type === 'https://smarthealth.cards#immunization')) {
    return {
      status: false,
      error: new Error('UNSUPPORTED_HEALTH_CARD')
    };
  }

  if (!getPatientData(cardJws)) {
    return {
      status: false,
      error: new Error('UNSUPPORTED_INVALID_PROFILE_MISSING_PATIENT')
    };
  }

  return { status: true, error: null };
};

export { healthCardVerify, issuerVerify, healthCardSupported };
