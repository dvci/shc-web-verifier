import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import https from 'https';
import jose from 'node-jose';
import {
  Typography
} from '@material-ui/core';
import { useQrDataContext } from 'components/QrDataProvider';
import { getIssuer, getJws } from 'utils/qrHelpers';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const HealthCardVerify = () => {
  const classes = useStyles();
  const { qrCode } = useQrDataContext();
  const jws = getJws(qrCode);
  const iss = getIssuer(qrCode);
  const [verified, setVerified] = useState();
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    async function verify() {
      let response;
      let verifier;

      if (!iss || typeof iss !== 'string') {
        throw Error('Invalid issuer.');
      }

      try {
        const jwkURL = `${iss}/.well-known/jwks.json`;
        response = await axios.get(jwkURL, { httpsAgent: agent });
      } catch (err) { // network error, incorrect URL or status!=2xx
        throw Error('Error retrieving issuer key URL.');
      }

      try {
        const keySet = await response.data;
        const keyStore = await jose.JWK.asKeyStore(keySet)
          .then((result) => result);
        verifier = jose.JWS.createVerify(keyStore);
      } catch (err) { // key format error
        throw Error('Error processing issuer keys.');
      }

      try {
        return await verifier.verify(jws)
          .then(() => true)
          .catch(() => false);
      } catch (err) {
        throw Error('Error validating signature.');
      }
    }

    verify()
      .then((status) => {
        setVerified(status);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setVerified(null);
      });
  }, [jws, iss]);

  return (
    <div className="HealthCardVerify">
      <Typography>
        <span className={classes.bold}>Verified: </span>
        <span>{String(verified)}</span>
      </Typography>
      <div id="errorMessage">
        <Typography>
          <span className={classes.bold}>Error: </span>
          <span>{error}</span>
        </Typography>
      </div>
    </div>
  );
};

export default HealthCardVerify;
