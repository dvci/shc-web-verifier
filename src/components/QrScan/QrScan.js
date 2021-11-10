import React from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import QrReader from 'react-qr-reader';
import { useHistory } from 'react-router-dom';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';

const useStyles = makeStyles(() => ({
  frame: {
    height: '550px',
    width: '640px',
    marginTop: '3rem',
    marginBottom: '3rem',
    zIndex: '2',
  },
  qrScanner: {
    position: 'absolute',
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

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const { setQrCode } = useQrDataContext();

  const handleScan = (data) => {
    if (data && data.startsWith('shc:/')) {
      setQrCode(data);
      history.push('/display-results');
    }
  }

  const handleError = () => {
    // TODO: Handle QR code scan error
  }

  return (
    <Box
      mt={10}
      display="flex"
      justifyContent="center"
      bgcolor="common.grayMedium"
    >
      <QrReader
        className={classes.qrScanner}
        onError={handleError}
        onScan={handleScan}
        showViewFinder={false}
      />
      <img
        alt="Scan Frame"
        className={classes.frame}
        src={frame}
      />
    </Box>
  );
};

export default QrScan;
