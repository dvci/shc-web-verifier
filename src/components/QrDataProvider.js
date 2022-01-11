import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import https from 'https';
import { getIssuer, getJws, getPayload } from 'utils/qrHelpers';
import { healthCardVerify, issuerVerify } from 'utils/verifyHelpers';
import { Validator } from 'components/Validator/Validator.tsx';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(JSON.parse(localStorage.getItem('qrCodes')));
  const [healthCardVerified, setHealthCardVerified] = useState({ verified: false, error: null });
  const [issuerVerified, setIssuerVerified] = useState(false);
  const [validPrimarySeries, setValidPrimarySeries] = useState(false);

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));

    if (qrCodes) {
      // Verify health card signature
      const jws = getJws(qrCodes);
      const iss = getIssuer(qrCodes);
      const agent = new https.Agent({
        rejectUnauthorized: false
      });

      healthCardVerify(agent, jws, iss)
        .then((status) => {
          if (status) setHealthCardVerified({ verified: true, error: null });
          else setHealthCardVerified({ verified: false, error: 'Not Verified' });
        }).catch((err) => {
          setHealthCardVerified({ verified: false, error: err.message });
        });

      // Verify issuer
      issuerVerify(iss)
        .then((status) => setIssuerVerified(status))
        .catch(() => setIssuerVerified(false));

      // Validate vaccine series
      try {
        const payload = getPayload(qrCodes);
        const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
        const results = Validator.execute(patientBundle, 'COVID-19');
        setValidPrimarySeries(results.some((series) => series.complete.length > 0));
      } catch {
        setValidPrimarySeries(false);
      }
    }
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{
        healthCardVerified,
        issuerVerified,
        qrCodes,
        setQrCodes,
        validPrimarySeries,
      }}
    >
      {children}
    </QrDataContext.Provider>
  )
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
