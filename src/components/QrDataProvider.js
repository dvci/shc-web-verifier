import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import axios from 'axios';
import https from 'https';
import jose from 'node-jose';
import { getIssuer, getJws } from 'utils/qrHelpers';

const QrDataContext = createContext();

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

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(JSON.parse(localStorage.getItem('qrCodes')));
  const [healthCardVerified, setHealthCardVerified] = useState({ verified: false, error: null });

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));

    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const jws = getJws(qrCodes);
    const iss = getIssuer(qrCodes);

    healthCardVerify(agent, jws, iss)
      .then((status) => {
        if (status) setHealthCardVerified({ verified: true, error: null });
        else setHealthCardVerified({ verified: false, error: 'Not Verified' });
      }).catch((err) => {
        setHealthCardVerified({ verified: false, error: err.message });
      });
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{ qrCodes, setQrCodes, healthCardVerified }}
    >
      {children}
    </QrDataContext.Provider>
  )
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
