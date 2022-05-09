import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import { Button, Grid, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';
import { parseHealthCardQr } from 'utils/qrHelpers';
import QrScanner from 'qr-scanner';
import { useErrorHandler } from 'react-error-boundary';
import { useHealthCardDataContext } from 'components/HealthCardDataProvider';

const useStyles = makeStyles((theme) => ({
  button: {
    '&:hover': {
      cursor: 'default',
    },
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '2em',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    [theme.breakpoints.down('md')]: {
      maxHeight: '550px',
      maxWidth: '300px',
      margin: '1rem',
    },
    [theme.breakpoints.up('md')]: {
      maxHeight: '550px',
      maxWidth: '650px',
      margin: '2rem',
    },
  },
  gridContainerMultiple: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'right',
    justifyContent: 'right',
    paddingBottom: '1rem',
  },
  gridItem: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  frame: {
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      maxHeight: '550px',
      maxWidth: '300px',
    },
    [theme.breakpoints.up('md')]: {
      maxHeight: '550px',
      maxWidth: '650px',
    },
    objectFit: 'contain',
    zIndex: '2',
  },
  qrScanner: {
    objectFit: 'cover',
    position: 'absolute',
    width: '90%',
    height: '90%',
    zIndex: '1',
    '& section': {
      position: 'unset !important',
      '& div': {
        boxShadow: 'unset !important',
      },
    },
  },
}));

let qrScan;

const cameraPermission = async () => {
  if (window.cordova) {
    if (
      window.cordova.platformId === 'android'
      || window.cordova.platformId === 'ios'
    ) {
      if (window.cordova.platformId === 'ios') {
        window.cordova.plugins.iosrtc.registerGlobals();
      }
      const { diagnostic } = window.cordova.plugins;
      diagnostic.enableDebug();
      return new Promise((resolve, reject) => {
        diagnostic.getCameraAuthorizationStatus(
          (status) => {
            if (status === diagnostic.permissionStatus.GRANTED) {
              resolve(true);
            } else {
              diagnostic.requestCameraAuthorization(
                (requestedStatus) => {
                  if (requestedStatus === diagnostic.permissionStatus.GRANTED) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                },
                (requestedError) => {
                  reject(requestedError);
                },
                false,
              );
            }
          },
          (error) => {
            reject(error);
          },
          false,
        );
      });
    }
  }
  return Promise.resolve(true);
};

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const handleErrorFallback = useErrorHandler();
  const { setQrCodes, resetQrCodes } = useQrDataContext();
  const [scannedCodes, setScannedCodes] = useState([]);
  const [scannedData, setScannedData] = useState('');
  const runningQrScanner = useRef(null);
  const scannedCodesRef = useRef([]);
  // eslint-disable-next-line max-len
  const { setHealthCardVerified, setHealthCardSupported, setIssuerVerified } = useHealthCardDataContext();

  const handleError = useCallback(() => {
    history.push('/display-results');
  }, [history]);

  /**
   * Create QrScanner instance using video element and specify result/error conditions
   * @param {*} videoElement HTML video element
   */
  const createQrScanner = (videoElement) => {
    if (!videoElement) {
      if (runningQrScanner.current) {
        qrScan.destroy();
      }
      return;
    }
    qrScan = new QrScanner(
      videoElement,
      (results) => {
        setScannedData(results.data);
      },
      {
        calculateScanRegion: (video) => ({
          // define scan region for QrScanner
          x: 0,
          y: 0,
          width: video.videoWidth,
          height: video.videoHeight,
        }),
      },
    );
    runningQrScanner.current = qrScan;
    qrScan.start().then(() => {
      qrScan.hasCamera = true;
    });
  };

  const videoRef = useRef(null);
  // Get user media when the page first renders, and feed into createQrScanner()
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        throw Error(`Cannot access video: ${err.message}.`);
      }
    };

    cameraPermission().then((granted) => {
      if (granted) {
        getUserMedia().then(() => {
          createQrScanner(videoRef.current);
        }, handleErrorFallback);
      }
    });

    return () => {
      if (runningQrScanner.current) runningQrScanner.current.stop();
    };
  }, [handleErrorFallback]);

  useEffect(() => {
    const handleScan = (data) => {
      const qrData = parseHealthCardQr(data);
      if (qrData && qrData.multipleChunks) {
        const chunkCount = +qrData.chunkCount;
        const currentChunkIndex = +qrData.chunkIndex;
        let tempScannedCodes = [...scannedCodesRef.current];
        if (tempScannedCodes.length !== chunkCount) {
          tempScannedCodes = new Array(chunkCount);
          tempScannedCodes.fill(null, 0, chunkCount);
        }

        if (tempScannedCodes[currentChunkIndex - 1] === null) {
          tempScannedCodes[currentChunkIndex - 1] = data;
        }

        if (tempScannedCodes.every((code) => code)) {
          resetQrCodes();
          setHealthCardVerified({
            verified: null,
            error: null,
          });
          setIssuerVerified(false);
          setHealthCardSupported({
            status: null,
            error: null,
          });
          setQrCodes(tempScannedCodes);
          history.push('/display-results');
        }
        setScannedCodes(tempScannedCodes);
        scannedCodesRef.current = tempScannedCodes;
      } else {
        resetQrCodes();
        setHealthCardVerified({
          verified: null,
          error: null,
        });
        setIssuerVerified(false);
        setHealthCardSupported({
          status: null,
          error: null,
        });
        setQrCodes([data]);
        history.push('/display-results');
      }
    };

    if (scannedData) {
      try {
        handleScan(scannedData);
      } catch (e) {
        handleError();
      }
    }
  }, [
    scannedData,
    handleError,
    history,
    setQrCodes,
    resetQrCodes,
    setHealthCardVerified,
    setIssuerVerified,
    setHealthCardSupported,
  ]);

  return (
    <Box className={classes.box}>
      <Grid container className={classes.grid}>
        {scannedCodes.length > 0 && (
          <Grid container item className={classes.gridContainerMultiple}>
            {scannedCodes.map((code, i) => (
              <Button
                className={classes.button}
                key={code || uuidv4()}
                variant="contained"
                color={code ? 'success' : 'error'}
                disableRipple
                style={{ marginRight: '0.5rem' }}
              >
                {`${i + 1}/${scannedCodes.length}`}
              </Button>
            ))}
          </Grid>
        )}
        <Grid item className={classes.gridItem}>
          <video muted id="test" className={classes.qrScanner} ref={videoRef} />
          <img alt="Scan Frame" className={classes.frame} src={frame} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default QrScan;
