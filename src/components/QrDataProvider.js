import React, {
  createContext, useContext, useEffect, useState
} from 'react';
import {
  parseHealthCardQr,
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
  const [qrError, setQrError] = useState(null);
  const [validationStatus, setValidationStatus] = useState({
    validPrimarySeries: null,
    error: null,
  });

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));

    let cardJws;
    if (qrCodes) {
      // check valid SHC QR
      const validShcQr = qrCodes.every((c) => parseHealthCardQr(c) !== null);
      if (!validShcQr) {
        setQrError('UNSUPPORTED_QR_NOT_SHC');
        setJws(null);
      } else {
        cardJws = getJws(qrCodes);
        setJws(cardJws);
      }
    } else setJws(null);

    if (cardJws) {
      // Validate vaccine series
      try {
        const payload = getPayload(cardJws);
        const patientBundle = JSON.parse(payload).vc.credentialSubject.fhirBundle;
        const results = Validator.execute(patientBundle, 'COVID-19');
        setValidationStatus(
          { validPrimarySeries: results.some((series) => series.validPrimarySeries), error: null }
        );
      } catch {
        setValidationStatus(
          { validPrimarySeries: false, error: 'VALIDATION_ERROR' }
        );
      }
    }
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{
        qrCodes,
        setQrCodes,
        qrError,
        jws,
        validationStatus,
      }}
    >
      {children}
    </QrDataContext.Provider>
  );
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
