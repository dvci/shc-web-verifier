import React, {
  useState, useRef, useEffect, useCallback
} from 'react';
import { Button, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';
import QrScanner from 'qr-scanner';

const useStyles = makeStyles(() => ({
  button: {
    '&:hover': {
      cursor: 'default',
    },
  },
  frame: {
    position: 'relative',
    height: '550px',
    width: '640px',
    marginTop: '3rem',
    marginBottom: '3rem',
    zIndex: '3',
  },
  qrScanner: {
    width: '570px',
    height: '500px',
    'object-fit': 'cover',
    position: 'absolute',
    marginLeft: '2.2rem',
    marginTop: '4.5rem',
    zIndex: '2',
    '& section': {
      position: 'unset !important',
      '& div': {
        boxShadow: 'unset !important',
      },
    },
  },
}));

const healthCardPattern = /^shc:\/(?<multipleChunks>(?<chunkIndex>[0-9]+)\/(?<chunkCount>[0-9]+)\/)?[0-9]+$/;

let qrScan;

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const { setQrCodes } = useQrDataContext();
  const [scannedCodes, setScannedCodes] = useState([]);
  const [scannedData, setScannedData] = useState('');
  const runningQrScanner = useRef(null);
  const scannedCodesRef = useRef([]);

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
      }
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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        throw Error('Cannot access video.');
      }
    };
    getUserMedia().then(() => {
      createQrScanner(videoRef.current);
    });
    return () => {
      if (runningQrScanner.current) runningQrScanner.current.stop();
    };
  }, []);

  useEffect(() => {
    const handleScan = (data) => {
      if (healthCardPattern.test(data)) {
        const match = data.match(healthCardPattern);
        if (match.groups.multipleChunks) {
          const chunkCount = +match.groups.chunkCount;
          const currentChunkIndex = +match.groups.chunkIndex;
          let tempScannedCodes = [...scannedCodesRef.current];
          if (tempScannedCodes.length !== chunkCount) {
            tempScannedCodes = new Array(chunkCount);
            tempScannedCodes.fill(null, 0, chunkCount);
          }

          if (tempScannedCodes[currentChunkIndex - 1] === null) {
            tempScannedCodes[currentChunkIndex - 1] = data;
          }

          if (tempScannedCodes.every((code) => code)) {
            setQrCodes(tempScannedCodes);
            history.push('/display-results');
          }
          setScannedCodes(tempScannedCodes);
          scannedCodesRef.current = tempScannedCodes;
        } else {
          setQrCodes([data]);
          history.push('/display-results');
        }
      }
    };

    if (scannedData) {
      try {
        handleScan(scannedData);
      } catch (e) {
        handleError();
      }
    }
  }, [scannedData, handleError, history, setQrCodes]);

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
          <Grid item xs={4} />
        </>
      )}
      <Grid item xs={4}>
        <video muted id="test" className={classes.qrScanner} ref={videoRef} />
        <img alt="Scan Frame" className={classes.frame} src={frame} />
      </Grid>
    </Grid>
  );
};

export default QrScan;
