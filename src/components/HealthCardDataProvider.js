import React, {
  createContext, useContext, useEffect, useState
} from 'react';
import https from 'https';
import {
  getPatientData,
  getIssuer,
  getIssuerDisplayName,
  getCredential
} from 'utils/qrHelpers';
import { healthCardVerify, issuerVerify } from 'utils/verifyHelpers';

const HealthCardDataContext = createContext();

const HealthCardDataProvider = ({ children }) => {
  const [jws, setJws] = useState(null);
  const [healthCardSupported, setHealthCardSupported] = useState({
    status: null,
    error: null,
  });
  const [healthCardVerified, setHealthCardVerified] = useState({
    verified: null,
    error: null,
  });
  const [issuerVerified, setIssuerVerified] = useState(null);
  const [issuerDisplayName, setIssuerDisplayName] = useState(null);

  useEffect(() => {
    const isHealthCardSupported = () => {
      let vc;
      try {
        vc = getCredential(jws);
      } catch {
        setHealthCardSupported({ status: false, error: 'MALFORMED_CREDENTIAL' })
        return false;
      }
      if (!vc.type.some((type) => type === 'https://smarthealth.cards#health-card')) {
        setHealthCardSupported({ status: false, error: 'UNSUPPORTED_CREDENTIAL' })
        return false;
      }

      if (!vc.type.some((type) => type === 'https://smarthealth.cards#immunization')) {
        setHealthCardSupported({ status: false, error: 'UNSUPPORTED_HEALTH_CARD' })
        return false;
      }

      if (!getPatientData(jws)) {
        setHealthCardSupported({ status: false, error: 'INVALID_PROFILE_MISSING_PATIENT' })
        return false;
      }

      setHealthCardSupported({ status: true, error: null })
      return true;
    }
    async function verifyHealthCard(agent, iss, abortController) {
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
          getIssuerDisplayName(jws, abortController)
            .then((result) => setIssuerDisplayName(result));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIssuerVerified(false);
        }
      }
    }

    const abortController = new AbortController();

    if (jws) {
      // check jws
      isHealthCardSupported()

      // Verify health card signature
      const iss = getIssuer(jws);
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      verifyHealthCard(agent, jws, iss, abortController);

      // Verify issuer
      verifyIssuer(iss, abortController);
    }

    return () => {
      abortController.abort()
    }
  }, [jws]);

  return (
    <HealthCardDataProvider.Provider
      value={{
        healthCardSupported,
        healthCardVerified,
        issuerVerified,
        issuerDisplayName,
        jws,
        setJws
      }}
    >
      {children}
    </HealthCardDataProvider.Provider>
  );
};

const useHealthCardDataContext = () => useContext(HealthCardDataContext);

export { HealthCardDataContext, HealthCardDataProvider, useHealthCardDataContext };
