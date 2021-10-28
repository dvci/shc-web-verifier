import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core';
import { useQrDataContext } from 'components/QrDataProvider';
import { getIssuer } from 'utils/qrHelpers';
import IssuerDirectories from './IssuerDirectories';

const useStyles = makeStyles({
  bold: {
    fontWeight: 'bold'
  }
});

const IssuerVerify = () => {
  const classes = useStyles();
  const { qrCode } = useQrDataContext();
  const iss = getIssuer(qrCode);
  const [issuerDirectories, setIssuerDirectories] = useState(null);
  const [verified, setVerified] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    IssuerDirectories.getIssuerDirectories()
      .then((fetchedDirectories) => {
        setIssuerDirectories(fetchedDirectories);
      }).catch(() => {
        setIssuerDirectories(null);
      });
  }, []);

  useEffect(() => {
    if (!issuerDirectories) {
      return;
    }

    const errorMessages = issuerDirectories.map((d) => {
      if (d.error) {
        return `${d.name}: ${d.error}`;
      }
      return null;
    });
    setErrors(errorMessages);

    const found = issuerDirectories.some((d) => {
      if (d.issuers && !d.error) {
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
          <span>{errors}</span>
        </Typography>
      </div>
    </div>
  );
};

export default IssuerVerify;
