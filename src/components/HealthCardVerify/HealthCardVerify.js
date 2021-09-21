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
      let keyStore;

      if (!vc.payload.iss || typeof vc.payload.iss !== 'string') {
        throw Error('Invalid issuer.');
      }

      try {
        const jwkURL = `${vc.payload.iss}/.well-known/jwks.json`;
        // https.globalAgent.options.rejectUnauthorized = false;

        const response = await axios.get(jwkURL, { httpsAgent: agent });
        const keySet = await response.data;
        keyStore = await jose.JWK.asKeyStore(keySet)
          .then((result) => result);
      } catch (err) {
        throw Error('Error retrieving issuer keys.');
      }

      try {
        const verifier = jose.JWS.createVerify(keyStore);
        return await verifier.verify(vc.jws)
          .then(() => true)
          .catch(() => false);
      } catch (err) {
        throw Error('Error validating signature.');
      }
    }

    verify()
      .then((status) => setVerified(status))
      .catch((err) => setError(err.message));
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
