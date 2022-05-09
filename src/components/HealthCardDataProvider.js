import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import https from 'https';
import {
  getPatientData,
  getIssuer,
  getIssuerDisplayName,
  getCredential,
} from 'utils/qrHelpers';
import { healthCardVerify, issuerVerify } from 'utils/verifyHelpers';

const HealthCardDataContext = createContext();

const HealthCardDataProvider = ({ healthCardJws, children }) => {
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
    const isHealthCardSupported = (cardJws) => {
      let vc;
      try {
        vc = getCredential(cardJws);
      } catch {
        setHealthCardSupported({
          status: false,
          error: new Error('UNSUPPORTED_MALFORMED_CREDENTIAL'),
        });
        return false;
      }
      if (
        !vc.type.some(
          (type) => type === 'https://smarthealth.cards#health-card',
        )
      ) {
        setHealthCardSupported({
          status: false,
          error: new Error('UNSUPPORTED_CREDENTIAL'),
        });
        return false;
      }

      if (
        !vc.type.some(
          (type) => type === 'https://smarthealth.cards#immunization',
        )
      ) {
        setHealthCardSupported({
          status: false,
          error: new Error('UNSUPPORTED_HEALTH_CARD'),
        });
        return false;
      }

      if (!getPatientData(cardJws)) {
        setHealthCardSupported({
          status: false,
          error: new Error('UNSUPPORTED_INVALID_PROFILE_MISSING_PATIENT'),
        });
        return false;
      }

      setHealthCardSupported({ status: true, error: null });
      return true;
    };
    async function verifyHealthCard(agent, cardJws, iss, abortController) {
      try {
        const status = await healthCardVerify(
          agent,
          cardJws,
          iss,
          abortController,
        );
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
          // eslint-disable-next-line max-len
          getIssuerDisplayName(cardJws, abortController).then((result) => setIssuerDisplayName(result));
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
        rejectUnauthorized: false,
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
        setIssuerVerified,
      }}
    >
      {children}
    </HealthCardDataContext.Provider>
  );
};

const useHealthCardDataContext = () => useContext(HealthCardDataContext);

export {
  HealthCardDataContext,
  HealthCardDataProvider,
  useHealthCardDataContext,
};
