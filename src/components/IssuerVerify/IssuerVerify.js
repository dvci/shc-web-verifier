import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import https from 'https';
import {
  Typography
} from '@material-ui/core';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const IssuerVerify = ({ iss }) => {
  const classes = useStyles();

  const [issuerDirectories, setIssuerDirectories] = useState(null);
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const defaultIssuerDirectories = [
      {
        name: 'VCI',
        URL: 'https://raw.githubusercontent.com/the-commons-project/vci-directory/main/vci-issuers.json'
      }
    ]

    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    async function fetchIssuerDirectories() {
      return Promise.all(defaultIssuerDirectories.map(async (d) => {
        const directory = d;
        let response;
        try {
          response = await axios.get(d.URL, { httpsAgent: agent });
        } catch (err) {
          throw Error('Error fetching issuer directory.');
        }

        directory.issuers = await response.data;
        if (!directory.issuers?.participating_issuers) {
          throw Error('Incorrect issuer directory format.');
        }
        return directory;
      }));
    }

    fetchIssuerDirectories()
      .then((fetchedDirectories) => {
        setIssuerDirectories(fetchedDirectories);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setIssuerDirectories(null);
      });
  }, []);

  useEffect(() => {
    if (!issuerDirectories) {
      return;
    }

    const found = issuerDirectories.some((d) => {
      if (d.issuers) {
        const issName = d.issuers?.participating_issuers
          .filter((issuer) => issuer.iss === iss)
          .map((issuer) => issuer.name)[0];
        if (issName) {
          return true;
        }
      }
      return false;
    });
    setVerified(found);
  }, [iss, issuerDirectories]);

  return (
    <div className="HealthCardVerify">
      <Typography>
        <span className={classes.bold}>Issuer Verified: </span>
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

export default IssuerVerify;
