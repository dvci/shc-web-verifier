import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import https from 'https';
import { getIssuer, getJws } from 'utils/qrHelpers';
import { healthCardVerify } from 'utils/verifyHelpers';

const QrDataContext = createContext();

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
