import React, {
  useState, useRef, useEffect, useCallback
} from 'react';
import { Button, Grid, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';
import QrScanner from 'qr-scanner';

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
    }
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
    objectFit: 'contain',
    position: 'absolute',
    width: '90%',
    zIndex: '1',
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
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
        }
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
