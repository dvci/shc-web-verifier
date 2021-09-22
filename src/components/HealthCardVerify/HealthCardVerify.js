import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import https from 'https';
import jose from 'node-jose';
import {
  Typography
} from '@material-ui/core';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const HealthCardVerify = ({ vc }) => {
  const classes = useStyles();

  const [verified, setVerified] = useState();
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    async function verify() {
      let response;
      let verifier;

      if (!vc.payload.iss || typeof vc.payload.iss !== 'string') {
        throw Error('Invalid issuer.');
      }

      try {
        const jwkURL = `${vc.payload.iss}/.well-known/jwks.json`;
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
        return await verifier.verify(vc.jws)
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
  }, [vc.jws, vc.payload.iss]);

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
