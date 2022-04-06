import React, {
  createContext, useContext, useEffect, useState
} from 'react';
import {
  getJws,
  getPayload,
} from 'utils/qrHelpers';
import { Validator } from 'components/Validator/Validator.tsx';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(
    JSON.parse(localStorage.getItem('qrCodes'))
  );
  const [jws, setJws] = useState(null);
  const [validPrimarySeries, setValidPrimarySeries] = useState(false);

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));

    let cardJws;
    if (qrCodes) {
      cardJws = getJws(qrCodes);
      setJws(cardJws);
    } else setJws(null);

    if (cardJws) {
      // Validate vaccine series
      try {
        const payload = getPayload(cardJws);
        const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
        const results = Validator.execute(patientBundle, 'COVID-19');
        setValidPrimarySeries(
          results.some((series) => series.validPrimarySeries)
        );
      } catch {
        setValidPrimarySeries(false);
      }
    }
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{
        qrCodes,
        setQrCodes,
        jws,
        validPrimarySeries,
      }}
    >
      {children}
    </QrDataContext.Provider>
  );
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
