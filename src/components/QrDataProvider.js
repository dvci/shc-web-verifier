import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(JSON.parse(localStorage.getItem('qrCodes')));

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
  }, [qrCodes]);

  return (
    <QrDataContext.Provider
      value={{ qrCodes, setQrCodes }}
    >
      {children}
    </QrDataContext.Provider>
  )
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataContext, QrDataProvider, useQrDataContext };
