import React, { useState } from 'react';
import { Button, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import QrReader from 'react-qr-reader';
import { useHistory } from 'react-router-dom';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';

const useStyles = makeStyles(() => ({
  button: {
    '&:hover': {
      cursor: 'default'
    }
  },
  frame: {
    position: 'relative',
    height: '550px',
    width: '640px',
    marginTop: '3rem',
    marginBottom: '3rem',
    zIndex: '2',
  },
  qrScanner: {
    position: 'absolute',
    marginLeft: '2.2rem',
    marginTop: '4.5rem',
    height: '500px',
    width: '570px',
    zIndex: '1',
    '& section': {
      position: 'unset !important',
      '& div': {
        boxShadow: 'unset !important'
      },
    },
  }
}));

const healthCardPattern = /^shc:\/(?<multipleChunks>(?<chunkIndex>[0-9]+)\/(?<chunkCount>[0-9]+)\/)?[0-9]+$/;

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const { setQrCode } = useQrDataContext();
  const [scannedCodes, setScannedCodes] = useState([]);

  const handleScan = (data) => {
    if (healthCardPattern.test(data)) {
      const match = data.match(healthCardPattern);
      if (match.groups.multipleChunks) {
        const chunkCount = +match.groups.chunkCount;
        const currentChunkIndex = +match.groups.chunkIndex;
        let tempScannedCodes = [...scannedCodes];
        if (tempScannedCodes.length !== chunkCount) {
          tempScannedCodes = new Array(chunkCount);
          tempScannedCodes.fill(null, 0, chunkCount);
        }

        if (tempScannedCodes[currentChunkIndex - 1] === null) {
          tempScannedCodes[currentChunkIndex - 1] = data;
        }

        if (tempScannedCodes.every((code) => code)) {
          setQrCode(data);
          history.push('/display-results');
        }

        setScannedCodes(tempScannedCodes);
      } else {
        setQrCode(data);
        history.push('/display-results');
      }
    }
  }

  const handleError = () => {
    // TODO: Handle QR code scan error
  }

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{ marginTop: '2rem' }}
    >
      {scannedCodes.length > 0 && (
        <>
          <Grid item xs={4} />
          <Grid item xs={4} alignItems="right" justifyContent="right">
            {scannedCodes.map((code, i) => (
              <Button
                className={classes.button}
                key={`qr-${i}`}
                variant="contained"
                color={code ? 'success' : 'error'}
                disableRipple
                style={{ marginRight: '0.5rem' }}
              >
                {`${i + 1}/${scannedCodes.length}`}
              </Button>
            ))}
          </Grid>
          <Grid item xs={4} />
        </>
      )}
      <Grid item xs={4}>
        <QrReader
          className={classes.qrScanner}
          onError={handleError}
          onScan={handleScan}
          showViewFinder={false}
        />
        <img alt="Scan Frame" className={classes.frame} src={frame} />
      </Grid>
    </Grid>
  );
};

export default QrScan;
