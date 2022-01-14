import React, {
  useState,
  useRef,
  createRef,
  useCallback,
  useEffect,
} from "react";
import { Button, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
//import QrReader from "react-qr-reader";
//import QrScanner from "qr-scanner";
import QrScanner from "./qr-scanner";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import frame from "assets/frame.png";
import { useQrDataContext } from "components/QrDataProvider";
import { convertCompilerOptionsFromJson } from "typescript";

const useStyles = makeStyles(() => ({
  button: {
    "&:hover": {
      cursor: "default",
    },
  },
  frame: {
    position: "relative",
    height: "550px",
    width: "640px",
    marginTop: "3rem",
    marginBottom: "3rem",
    zIndex: "2",
  },
  qrScanner: {
    width: "570px",
    height: "500px",
    "object-fit": "cover",
    position: "absolute",
    marginLeft: "2.2rem",
    marginTop: "4.5rem",
    "object-fit": "fill",
    zIndex: "1",
    "& section": {
      position: "unset !important",
      "& div": {
        boxShadow: "unset !important",
      },
    },
  },
}));

QrScanner.WORKER_PATH = "src/components/QrScan/qr-scanner-worker.min.js";

const healthCardPattern =
  /^shc:\/(?<multipleChunks>(?<chunkIndex>[0-9]+)\/(?<chunkCount>[0-9]+)\/)?[0-9]+$/;

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const { setQrCodes } = useQrDataContext();
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
          setQrCodes(tempScannedCodes);
          history.push("/display-results");
        }

        setScannedCodes(tempScannedCodes);
      } else {
        setQrCodes([data]);
        history.push("/display-results");
      }
    }
  };

  const handleError = () => {
    history.push("/display-results");
  };

  const runningQrScanner = useRef(null);
  let qrScanner; // scope bound to callback

  let qrScan; // scope bound to callback

  const videoCallback = useCallback((videoElement) => {
    // code to run on component mount
    qrScan = new QrScanner(
      videoElement,
      (result) => {
        console.log("got result");
        handleScan(result);
        qrScan.stop();
      },
      (error) => handleError(),
      (videoElement) => ({
        x: 0,
        y: 0,
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      })
    );
    runningQrScanner.current = qrScanner;
    qrScan.start();
    return () => {
      qrScan.stop();
    };
  }, []);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{ marginTop: "2rem" }}
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
                color={code ? "success" : "error"}
                disableRipple
                style={{ marginRight: "0.5rem" }}
              >
                {`${i + 1}/${scannedCodes.length}`}
              </Button>
            ))}
          </Grid>
          <Grid item xs={4} />
        </>
      )}
      <Grid item xs={4}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className={classes.qrScanner} autoPlay ref={videoCallback} />
        {/* <QrReader
          className={classes.qrScanner}
          onError={handleError}
          onScan={handleScan}
          showViewFinder={false}
        /> */}
        <img alt="Scan Frame" className={classes.frame} src={frame} />
      </Grid>
    </Grid>
  );
};

export default QrScan;
