import React, { createContext, useContext, useState } from 'react';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(null);

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
