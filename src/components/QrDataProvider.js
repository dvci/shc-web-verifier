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
  const [validPrimarySeries, setValidPrimarySeries] = useState(false);

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
    const abortController = new AbortController();

    if (qrCodes) {
      // Validate vaccine series
      try {
        const jws = getJws(qrCodes)
        const payload = getPayload(jws);
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
