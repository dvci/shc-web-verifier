import React, { createContext, useContext, useState } from 'react';

const QrDataContext = createContext();

const QrDataProvider = ({ children }) => {
  const [qrCode, setQrCode] = useState(null);

  return (
    <QrDataContext.Provider
      value={{ qrCode, setQrCode }}
    >
      {children}
    </QrDataContext.Provider>
  )
};

const useQrDataContext = () => useContext(QrDataContext);

export { QrDataProvider, useQrDataContext };
