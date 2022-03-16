import React, {
  createContext, useContext, useEffect, useState
} from 'react';
import https from 'https';
import {
  getIssuer,
  getJws,
  getPayload,
  getIssuerDisplayName,
} from 'utils/qrHelpers';
import { healthCardVerify, issuerVerify } from 'utils/verifyHelpers';
import { Validator } from 'components/Validator/Validator.tsx';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(
    JSON.parse(localStorage.getItem('qrCodes'))
  );
  const [healthCardVerified, setHealthCardVerified] = useState({
    verified: false,
    error: null,
  });
  const [issuerVerified, setIssuerVerified] = useState(false);
  const [validPrimarySeries, setValidPrimarySeries] = useState(false);
  const [issuerDisplayName, setIssuerDisplayName] = useState(null);

  useEffect(() => {
    async function verifyHealthCard(agent, jws, iss, abortController) {
      try {
        const status = await healthCardVerify(agent, jws, iss, abortController);
        if (status) setHealthCardVerified({ verified: true, error: null });
        else setHealthCardVerified({ verified: false, error: 'Not Verified' });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setHealthCardVerified({ verified: false, error: error.message });
        }
      }
    }
    async function verifyIssuer(iss, abortController) {
      try {
        const status = await issuerVerify(iss, abortController);
        setIssuerVerified(status);
        if (status === true) {
          getIssuerDisplayName(qrCodes, abortController)
            .then((result) => setIssuerDisplayName(result));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIssuerVerified(false);
        }
      }
    }

    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
    const abortController = new AbortController();

    if (qrCodes) {
      // Verify health card signature
      const jws = getJws(qrCodes);
      const iss = getIssuer(qrCodes);
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      verifyHealthCard(agent, jws, iss, abortController);

      // Verify issuer
      verifyIssuer(iss, abortController);

      // Validate vaccine series
      try {
        const payload = getPayload(qrCodes);
        const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
        const results = Validator.execute(patientBundle, 'COVID-19');
        setValidPrimarySeries(
          results.some((series) => series.complete.length > 0)
        );
      } catch {
        setValidPrimarySeries(false);
      }
    }

    return () => {
      abortController.abort()
    }
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{
        healthCardVerified,
        issuerVerified,
        issuerDisplayName,
        qrCodes,
        setQrCodes,
        validPrimarySeries,
      }}
    >
      {children}
    </QrDataContext.Provider>
  );
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
