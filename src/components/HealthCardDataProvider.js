import React, {
  createContext, useContext, useEffect, useState
} from 'react';
import https from 'https';
import { getIssuer, getIssuerDisplayName } from 'utils/qrHelpers';
import { healthCardVerify, issuerVerify, healthCardSupported as checkHealthCardSupported } from 'utils/verifyHelpers';

const HealthCardDataContext = createContext();

const HealthCardDataProvider = ({ healthCardJws, children }) => {
  const [jws, setJws] = useState(null);
  const [healthCardSupported, setHealthCardSupported] = useState({
    status: null,
    error: null
  });
  const [healthCardVerified, setHealthCardVerified] = useState({
    verified: null,
    error: null
  });
  const [issuerVerified, setIssuerVerified] = useState(null);
  const [issuerDisplayName, setIssuerDisplayName] = useState(null);

  useEffect(() => {
    const isHealthCardSupported = (cardJws) => {
      const result = checkHealthCardSupported(cardJws);
      setHealthCardSupported(result);
      return result.status;
    };
    async function verifyHealthCard(agent, cardJws, iss, abortController) {
      try {
        const status = await healthCardVerify(agent, cardJws, iss, abortController);
        setHealthCardVerified({ verified: status, error: null });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setHealthCardVerified({ verified: false, error });
        }
      }
    }
    async function verifyIssuer(iss, cardJws, abortController) {
      try {
        const status = await issuerVerify(iss, abortController);
        setIssuerVerified(status);
        if (status === true) {
          getIssuerDisplayName(cardJws, abortController).then(
            (result) => setIssuerDisplayName(result)
          );
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIssuerVerified(false);
        }
      }
    }

    const abortController = new AbortController();

    setJws(healthCardJws);
    if (healthCardJws) {
      // check jws
      isHealthCardSupported(healthCardJws);

      // Verify health card signature
      const iss = getIssuer(healthCardJws);
      const agent = new https.Agent({
        rejectUnauthorized: false
      });
      verifyHealthCard(agent, healthCardJws, iss, abortController);

      // Verify issuer
      verifyIssuer(iss, healthCardJws, abortController);
    }

    return () => {
      abortController.abort();
    };
  }, [healthCardJws]);

  return (
    <HealthCardDataContext.Provider
      value={{
        healthCardSupported,
        healthCardVerified,
        issuerVerified,
        issuerDisplayName,
        jws,
        setJws,
        setHealthCardSupported,
        setHealthCardVerified,
        setIssuerVerified
      }}
    >
      {children}
    </HealthCardDataContext.Provider>
  );
};

const useHealthCardDataContext = () => useContext(HealthCardDataContext);

export { HealthCardDataContext, HealthCardDataProvider, useHealthCardDataContext };
