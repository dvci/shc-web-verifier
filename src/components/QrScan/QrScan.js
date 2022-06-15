import React, {
  useState, useRef, useEffect, useCallback
} from 'react';
import {
  Button, Grid, Box, IconButton
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';
import { parseHealthCardQr } from 'utils/qrHelpers';
import { cameraPermission, switchCamera } from 'utils/cameraHelper';
import QrScanner from 'qr-scanner';
import { useErrorHandler } from 'react-error-boundary';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';

const useStyles = makeStyles((theme) => ({
  button: {
    '&:hover': {
      cursor: 'default'
    }
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '2em'
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
      margin: '1rem'
    },
    [theme.breakpoints.up('md')]: {
      maxHeight: '550px',
      maxWidth: '650px',
      margin: '2rem'
    }
  },
  gridContainerMultiple: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'right',
    justifyContent: 'right',
    paddingBottom: '1rem'
  },
  gridItem: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  frame: {
    position: 'relative',
    [theme.breakpoints.down('md')]: {
      maxHeight: '550px',
      maxWidth: '300px'
    },
    [theme.breakpoints.up('md')]: {
      maxHeight: '550px',
      maxWidth: '650px'
    },
    objectFit: 'contain',
    zIndex: '2'
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
        boxShadow: 'unset !important'
      }
    }
  }
}));

let qrScan;

const QrScan = () => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const handleErrorFallback = useErrorHandler();
  const {
    setQrCodes, resetQrCodes, setQrError, qrCodes
  } = useQrDataContext();
  const [scannedCodes, setScannedCodes] = useState([]);
  const [scannedData, setScannedData] = useState('');
  const [cameraDeviceId, setCameraDeviceId] = useState('');
  const runningQrScanner = useRef(null);
  const scannedCodesRef = useRef([]);

  const handleError = useCallback(() => {
    history.push('/display-results');
  }, [history]);

  const handleCameraSwitch = () => {
    switchCamera(cameraDeviceId)
      .then((newDeviceId) => {
        if (newDeviceId !== null) {
          setCameraDeviceId(newDeviceId);
          if (runningQrScanner.current) {
            runningQrScanner.current.setCamera(newDeviceId);
          }
        }
      })
  };

  useEffect(() => () => {
    if (runningQrScanner.current) {
      runningQrScanner.current.stop();
    }
  }, [])

  const videoRef = useRef(null);
  // Get user media when the page first renders, and feed into createQrScanner()
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia(
            cameraDeviceId !== '' ? { audio: false, video: { deviceId: { exact: cameraDeviceId } } }
              : { audio: false, video: { facingMode: 'environment' } }
          );
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        throw Error(`Cannot access video: ${err.message}.`);
      }
    };

    /**
   * Create QrScanner instance using video element and specify result/error conditions
   * @param {*} videoElement HTML video element
   */
    const createQrScanner = async (videoElement) => {
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
          preferredCamera: 'environment',
          calculateScanRegion: (video) => ({
          // define scan region for QrScanner
            x: 0,
            y: 0,
            width: video.videoWidth,
            height: video.videoHeight
          })
        }
      );
      runningQrScanner.current = qrScan;

      const startPromise = qrScan.start();
      if (startPromise !== undefined) {
        startPromise.then(() => {
          qrScan.hasCamera = true;
          const videoTrack = videoElement.srcObject.getVideoTracks()[0].getSettings().deviceId;
          setCameraDeviceId(cameraDeviceId !== '' ? cameraDeviceId : videoTrack);
        });
      }
    };

    if (!runningQrScanner.current || (window.cordova && window.cordova.platformId === 'ios')) {
      cameraPermission().then((granted) => {
        if (granted) {
          getUserMedia().then(async () => {
            await createQrScanner(videoRef.current);
          }, handleErrorFallback);
        } else {
          resetQrCodes();
          setQrError(new Error('SCAN_CAMERA_UNAVAILABLE'));
          history.push('/display-results');
        }
      });
    }
  }, [handleErrorFallback, history, resetQrCodes, setQrError, cameraDeviceId]);

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
          if (location.state === 'link') {
            const previousQrCodes = qrCodes;
            resetQrCodes();
            // Append to running list of scanned QR codes
            setQrCodes([...previousQrCodes, [tempScannedCodes]]);
          } else {
            resetQrCodes();
            setQrCodes([tempScannedCodes]);
          }
          history.push('/display-results');
        }
        setScannedCodes(tempScannedCodes);
        scannedCodesRef.current = tempScannedCodes;
      } else {
        if (qrCodes && location.state === 'link') {
          const allQrCodes = qrCodes;
          resetQrCodes();
          allQrCodes.push(data);
          setQrCodes(allQrCodes);
        } else {
          resetQrCodes();
          setQrCodes([data]);
        }
        history.push('/display-results');
      }
    }

    if (scannedData) {
      try {
        handleScan(scannedData);
      } catch (e) {
        handleError();
      }
    }

    return () => {
      setScannedData('');
    }
  }, [scannedData, handleError, history, location, setQrCodes, resetQrCodes, qrCodes]);

  return (
    <Box className={classes.box}>
      <Grid container className={classes.grid}>
        <Grid container item flexWrap="nowrap" width="100%" height="100%">
          <IconButton onClick={() => handleCameraSwitch()}>
            <CameraswitchIcon fontSize="large" />
          </IconButton>
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
        </Grid>
        <Grid item className={classes.gridItem}>
          <video muted id="test" className={classes.qrScanner} ref={videoRef} />
          <img alt="Scan Frame" className={classes.frame} src={frame} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default QrScan;
