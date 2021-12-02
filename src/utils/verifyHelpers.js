import axios from 'axios';
import jose from 'node-jose';

const healthCardVerify = async (httpsAgent, jws, iss) => {
  let response;
  let verifier;

  if (!iss || typeof iss !== 'string') {
    throw Error('Invalid issuer.');
  }

  try {
    const jwkURL = `${iss}/.well-known/jwks.json`;
    response = await axios.get(jwkURL, { httpsAgent });
  } catch (err) { // network error, incorrect URL or status!=2xx
    throw Error('Error retrieving issuer key URL.');
  }

  try {
    const keySet = await response.data;
    const keyStore = await jose.JWK.asKeyStore(keySet)
      .then((result) => result);
    verifier = jose.JWS.createVerify(keyStore);
  } catch (err) { // key format error
    throw Error('Error processing issuer keys.');
  }

  try {
    return await verifier.verify(jws)
      .then(() => true)
      .catch(() => false);
  } catch (err) {
    throw Error('Error validating signature.');
  }
};

export {
  healthCardVerify,
};
