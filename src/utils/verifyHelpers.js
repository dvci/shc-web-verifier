import axios from 'axios';
import jose from 'node-jose';
import getIssuerDirectories from './IssuerDirectories';

const healthCardVerify = async (httpsAgent, jws, iss, controller) => {
  let response;
  let verifier;

  if (!iss || typeof iss !== 'string') {
    throw Error('UNVERIFIED_INVALID_ISSUER');
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
    const keyStore = await jose.JWK.asKeyStore(keySet).then((result) => result);
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
  .then((fetchedDirectories) => fetchedDirectories.some((d) => {
    if (d.issuers && !d.error) {
      const issName = d.issuers?.participating_issuers
        .filter((issuer) => issuer.iss === iss)
        .map((issuer) => issuer.name)[0];
      if (issName) {
        return true;
      }
    }

    return false;
  }))
  .catch(() => false);

export {
  healthCardVerify,
  issuerVerify,
};
